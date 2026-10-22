import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { supprimerComptePorts } from '@app/web/composition/utilisateurs/supprimer-compte.ports'
import { supprimerCompte } from '@app/web/features/utilisateurs/abilities/supprimer-compte'
import {
  AdresseCourriel,
  AuteurId,
  estCourrielAnonymise,
  estRoleProtege,
  RoleUtilisateur,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import type { JobExecutor } from '@app/web/jobs/jobExecutors'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'

const DOSSIER = 'output/rattrapage-comptes-supprimes'

const EN_TETE = [
  'utilisateur_id',
  'supprime_le',
  'role',
  'courriel_anonymise',
  'liaisons',
  'resultat',
  'etapes',
]

type Issue = {
  readonly resultat: string
  readonly etapes: string
}

const lireLesComptesSupprimes = () =>
  prismaClient.user.findMany({
    where: { deleted: { not: null } },
    select: {
      id: true,
      email: true,
      role: true,
      deleted: true,
      _count: { select: { accounts: true } },
    },
    orderBy: { deleted: 'asc' },
  })

type CompteSupprime = Awaited<
  ReturnType<typeof lireLesComptesSupprimes>
>[number]

const estProtege = (compte: CompteSupprime): boolean =>
  estRoleProtege(RoleUtilisateur(compte.role))

const courrielAnonymise = (compte: CompteSupprime): string => {
  const courriel = AdresseCourriel.safe(compte.email)

  return courriel == null
    ? 'invalide'
    : estCourrielAnonymise(courriel)
      ? 'oui'
      : 'non'
}

const rejouerSansEchouer = (
  compte: CompteSupprime,
  administrateurId: AuteurId,
): Promise<Issue> =>
  rejouer(compte, administrateurId).catch((erreur: unknown) => ({
    resultat: `exception ${erreur instanceof Error ? erreur.message : String(erreur)}`,
    etapes: '',
  }))

const rejouer = async (
  compte: CompteSupprime,
  administrateurId: AuteurId,
): Promise<Issue> => {
  const resultat = await supprimerCompte({
    command: {
      cible: UtilisateurId(compte.id),
      auteur: { _tag: 'administrateur', administrateurId },
      maintenant: new Date(),
    },
    ports: supprimerComptePorts,
  })

  if (!resultat.success) {
    return { resultat: `erreur ${resultat.error._tag}`, etapes: '' }
  }

  const { report } = resultat.data

  return {
    resultat:
      report._tag === 'complete'
        ? 'effacement complet'
        : `effacement partiel (${report.failed.join(', ')})`,
    etapes: report.results
      .map((etape) =>
        etape._tag === 'erased'
          ? `${etape.step}:${etape.count}`
          : etape._tag === 'failed'
            ? `${etape.step}:échec ${etape.cause}`
            : null,
      )
      .filter((etape) => etape != null)
      .join(' '),
  }
}

const issueAuBlanc = (compte: CompteSupprime): Issue => ({
  resultat: estProtege(compte) ? 'rôle protégé, ignoré' : 'à rejouer',
  etapes: '',
})

const cellule = (valeur: string): string =>
  valeur === '' ? '' : `"${valeur.replaceAll('"', '""')}"`

const ligne = (compte: CompteSupprime, issue: Issue): string =>
  [
    compte.id,
    compte.deleted?.toISOString() ?? '',
    compte.role,
    courrielAnonymise(compte),
    String(compte._count.accounts),
    cellule(issue.resultat),
    cellule(issue.etapes),
  ].join(';')

const deposerLeReleve = (lignes: readonly string[]): string => {
  const dossier = join(process.cwd(), DOSSIER)
  mkdirSync(dossier, { recursive: true })

  const fichier = join(
    dossier,
    `rattrapage-${new Date().toISOString().replaceAll(':', '-')}.csv`,
  )
  writeFileSync(fichier, `${[EN_TETE.join(';'), ...lignes].join('\n')}\n`)

  return fichier
}

export const executeRattraperLesComptesSupprimes: JobExecutor<
  'rattraper-les-comptes-supprimes'
> = async (job) => {
  const { appliquer } = job.payload
  const administrateurId = AuteurId(job.payload.administrateurId)

  const comptes = await lireLesComptesSupprimes()

  output.log(
    `rattraper-les-comptes-supprimes: ${comptes.length} comptes supprimés, ${appliquer ? 'application' : 'à blanc'}`,
  )

  const lignes = await comptes.reduce<Promise<readonly string[]>>(
    async (precedentes, compte, index) => {
      const dejaFaites = await precedentes
      const issue =
        appliquer && !estProtege(compte)
          ? await rejouerSansEchouer(compte, administrateurId)
          : issueAuBlanc(compte)

      if ((index + 1) % 100 === 0) {
        output.log(
          `rattraper-les-comptes-supprimes: ${index + 1}/${comptes.length}`,
        )
      }

      return [...dejaFaites, ligne(compte, issue)]
    },
    Promise.resolve([]),
  )

  const fichier = deposerLeReleve(lignes)

  return {
    appliquer,
    comptes: comptes.length,
    courrielsEnClair: comptes.filter(
      (compte) => courrielAnonymise(compte) !== 'oui',
    ).length,
    avecLiaison: comptes.filter((compte) => compte._count.accounts > 0).length,
    rolesProteges: comptes.filter(estProtege).length,
    releve: fichier,
  }
}
