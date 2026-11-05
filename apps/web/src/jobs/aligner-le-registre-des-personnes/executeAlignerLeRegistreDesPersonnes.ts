import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { JobExecutor } from '@app/web/jobs/jobExecutors'
import { output } from '@app/web/jobs/output'
import {
  apercuDeLaSynchronisation,
  synchroniserPersonne,
} from '@app/web/libraries/registre-personne'
import { prismaClient } from '@app/web/prismaClient'
import {
  aQuelqueChoseADire,
  type CompteAuReleve,
  comptesParColonne,
  estAMasquer,
  estEnAttenteDArbitrage,
  type LigneDuReleve,
  ligneDuReleve,
  releveEnCsv,
  type Signalements,
} from './releve'

const DOSSIER = 'output/aligner-le-registre-des-personnes'

const FICHIER = 'aligner-le-registre-des-personnes.csv'

const SEUIL_DE_NOM_SANS_RAPPORT = 0.3

const comptesAuReleve = async (): Promise<readonly CompteAuReleve[]> => {
  const comptes = await prismaClient.user.findMany({
    where: { isFixture: false },
    select: {
      id: true,
      deleted: true,
      lastLogin: true,
      mediateur: {
        select: {
          id: true,
          isVisible: true,
          enActivite: {
            where: { suppression: null, fin: null },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { created: 'asc' },
  })

  return comptes.map(({ id, deleted, lastLogin, mediateur }) => ({
    id,
    deleted,
    lastLogin,
    mediateur:
      mediateur === null
        ? null
        : {
            id: mediateur.id,
            isVisible: mediateur.isVisible,
            aUnLieuActif: mediateur.enActivite.length > 0,
          },
  }))
}

const comptesIdentifies = async (
  requete: Promise<readonly { readonly id: string }[]>,
): Promise<ReadonlySet<string>> => new Set((await requete).map(({ id }) => id))

const comptesDontLeCourrielEstAUnAutre = () =>
  comptesIdentifies(
    prismaClient.$queryRaw<{ id: string }[]>`
      SELECT u.id
      FROM main.personne p
      JOIN coop.users u ON u.id = p.coop_id
      JOIN coop.users autre
        ON lower(autre.email) = lower(p.contact->'coop'->>'email')
       AND autre.id <> u.id
       AND autre.deleted IS NULL
      WHERE u.deleted IS NULL`,
  )

const comptesAuNomSansRapport = () =>
  comptesIdentifies(
    prismaClient.$queryRaw<{ id: string }[]>`
      SELECT u.id
      FROM main.personne p
      JOIN coop.users u ON u.id = p.coop_id
      WHERE u.deleted IS NULL
        AND p.nom IS NOT NULL
        AND similarity(
          lower(p.prenom || ' ' || p.nom),
          lower(u.first_name || ' ' || u.last_name)
        ) < ${SEUIL_DE_NOM_SANS_RAPPORT}`,
  )

export const alignerUnCompte = async ({
  compte,
  masquer,
  maintenant,
}: {
  readonly compte: CompteAuReleve
  readonly masquer: boolean
  readonly maintenant: Date
}): Promise<void> => {
  await prismaClient.$transaction(async (transaction) => {
    if (masquer && compte.mediateur !== null) {
      await transaction.mediateur.update({
        where: { id: compte.mediateur.id },
        data: { isVisible: false },
      })
    }
    await synchroniserPersonne(transaction, compte.id, maintenant)
  })
}

type Traitement = {
  readonly lignes: readonly LigneDuReleve[]
  readonly comptesAlignes: number
  readonly echecs: readonly string[]
}

const traiterUnCompte =
  ({
    appliquer,
    inclureLesComptesSupprimesMultiSources,
    maintenant,
    signalementsDe,
  }: {
    readonly appliquer: boolean
    readonly inclureLesComptesSupprimesMultiSources: boolean
    readonly maintenant: Date
    readonly signalementsDe: (id: string) => Signalements
  }) =>
  async (
    precedent: Promise<Traitement>,
    compte: CompteAuReleve,
  ): Promise<Traitement> => {
    const { lignes, comptesAlignes, echecs } = await precedent

    try {
      const apercu = await apercuDeLaSynchronisation(compte.id, maintenant)
      if (apercu === null) return { lignes, comptesAlignes, echecs }

      const ligne = ligneDuReleve({
        compte,
        apercu,
        signalements: signalementsDe(compte.id),
        maintenant,
      })
      const lignesSuivantes = aQuelqueChoseADire(ligne)
        ? [...lignes, ligne]
        : lignes
      const masquer = estAMasquer(compte, apercu.lien, maintenant)
      const aAligner =
        (apercu.alignement !== null || apercu.lien !== 'reliee' || masquer) &&
        (inclureLesComptesSupprimesMultiSources ||
          !estEnAttenteDArbitrage(compte, apercu))

      if (!appliquer || !aAligner) {
        return { lignes: lignesSuivantes, comptesAlignes, echecs }
      }

      await alignerUnCompte({ compte, masquer, maintenant })

      return {
        lignes: lignesSuivantes,
        comptesAlignes: comptesAlignes + 1,
        echecs,
      }
    } catch (erreur) {
      output.error(
        `aligner-le-registre-des-personnes: échec sur ${compte.id}`,
        erreur,
      )
      return { lignes, comptesAlignes, echecs: [...echecs, compte.id] }
    }
  }

const deposerLeReleve = (lignes: readonly LigneDuReleve[]): string => {
  const dossier = join(process.cwd(), DOSSIER)
  mkdirSync(dossier, { recursive: true })
  const chemin = join(dossier, FICHIER)
  writeFileSync(chemin, releveEnCsv(lignes), 'utf8')
  return chemin
}

export const executeAlignerLeRegistreDesPersonnes: JobExecutor<
  'aligner-le-registre-des-personnes'
> = async (job) => {
  const appliquer = job.payload?.appliquer ?? false
  const inclureLesComptesSupprimesMultiSources =
    job.payload?.inclureLesComptesSupprimesMultiSources ?? false
  const maintenant = new Date()

  const [comptes, courrielsDUnAutre, nomsSansRapport] = await Promise.all([
    comptesAuReleve(),
    comptesDontLeCourrielEstAUnAutre(),
    comptesAuNomSansRapport(),
  ])

  const { lignes, comptesAlignes, echecs } = await comptes.reduce(
    traiterUnCompte({
      appliquer,
      inclureLesComptesSupprimesMultiSources,
      maintenant,
      signalementsDe: (id) => ({
        courrielDUnAutreCompte: courrielsDUnAutre.has(id),
        nomSansRapport: nomsSansRapport.has(id),
      }),
    }),
    Promise.resolve<Traitement>({ lignes: [], comptesAlignes: 0, echecs: [] }),
  )

  const chemin = deposerLeReleve(lignes)
  const parColonne = comptesParColonne(lignes)

  output.log(
    [
      `aligner-le-registre-des-personnes: ${appliquer ? 'APPLICATION' : 'À BLANC'}`,
      `comptes mesurés       ${comptes.length}`,
      `comptes au relevé     ${lignes.length}`,
      `comptes alignés       ${comptesAlignes}`,
      `échecs                ${echecs.length}`,
      ...Object.entries(parColonne).map(
        ([colonne, nombre]) => `  ${colonne.padEnd(22)} ${nombre}`,
      ),
      chemin,
    ].join('\n'),
  )

  return {
    appliquer,
    comptesMesures: comptes.length,
    comptesAuReleve: lignes.length,
    comptesAlignes,
    parColonne,
    echecs,
  }
}
