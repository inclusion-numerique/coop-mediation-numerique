import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { telephoneEnregistrable } from '@app/web/features/utilisateurs/domain'
import type { Prisma } from '@app/web/generated/prisma/client'
import type { JobExecutor } from '@app/web/jobs/jobExecutors'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'

const DOSSIER = 'output/normalisation-telephones'

const DELAI_DE_LA_TRANSACTION_MS = 5 * 60 * 1000

const EN_TETE = [
  'utilisateur_id',
  'telephone_actuel',
  'telephone_normalise',
  'resultat',
]

type Correction = {
  readonly utilisateurId: string
  readonly actuel: string
  readonly normalise: string | null
}

const LIGNE_FRANCAISE_EN_TOUTES_LETTRES = /^0{1,2}33(\d{9})$/
const INDICATIF_ULTRAMARIN = /^\+(?:262|590|594|596)(\d{9})$/

const candidatsDeRattrapage = (saisi: string): readonly string[] => {
  const compact = saisi.replace(/[\s()./-]/g, '')
  const enToutesLettres = compact.match(LIGNE_FRANCAISE_EN_TOUTES_LETTRES)
  const ultramarin = compact.match(INDICATIF_ULTRAMARIN)
  return [
    ...(enToutesLettres === null ? [] : [`+33${enToutesLettres[1]}`]),
    ...(ultramarin === null ? [] : [`+33${ultramarin[1]}`]),
  ]
}

const normaliser = (saisi: string | null): string | null =>
  telephoneEnregistrable(saisi) ??
  (saisi === null
    ? null
    : (candidatsDeRattrapage(saisi)
        .map(telephoneEnregistrable)
        .find((candidat) => candidat !== null) ?? null))

const lireLesCorrections = async (): Promise<readonly Correction[]> => {
  const comptes = await prismaClient.user.findMany({
    where: { deleted: null, phone: { not: null } },
    select: { id: true, phone: true },
    orderBy: { created: 'asc' },
  })

  return comptes
    .map(({ id, phone }) => ({
      utilisateurId: id,
      actuel: phone ?? '',
      normalise: normaliser(phone),
    }))
    .filter(({ actuel, normalise }) => actuel !== normalise)
}

const resultat = ({ normalise }: Correction, appliquer: boolean): string =>
  normalise === null
    ? appliquer
      ? 'valeur effacée'
      : 'à effacer'
    : appliquer
      ? 'corrigé'
      : 'à corriger'

const cellule = (valeur: string): string =>
  valeur === '' ? '' : `"${valeur.replaceAll('"', '""')}"`

const ligne = (correction: Correction, appliquer: boolean): string =>
  [
    correction.utilisateurId,
    cellule(correction.actuel),
    cellule(correction.normalise ?? ''),
    resultat(correction, appliquer),
  ].join(';')

const deposerLeReleve = (lignes: readonly string[]): string => {
  const dossier = join(process.cwd(), DOSSIER)
  mkdirSync(dossier, { recursive: true })

  const fichier = join(
    dossier,
    `normalisation-${new Date().toISOString().replaceAll(':', '-')}.csv`,
  )
  writeFileSync(fichier, `${[EN_TETE.join(';'), ...lignes].join('\n')}\n`)

  return fichier
}

const enregistrer =
  (transaction: Prisma.TransactionClient) =>
  ({ utilisateurId, normalise }: Correction) =>
    transaction.user.update({
      where: { id: utilisateurId },
      data: { phone: normalise },
    })

const enregistrerToutes = (corrections: readonly Correction[]) =>
  prismaClient.$transaction(
    (transaction) =>
      corrections.reduce<Promise<unknown>>(
        (precedente, correction) =>
          precedente.then(() => enregistrer(transaction)(correction)),
        Promise.resolve(),
      ),
    { timeout: DELAI_DE_LA_TRANSACTION_MS },
  )

export const executeNormaliserLesTelephones: JobExecutor<
  'normaliser-les-telephones'
> = async (job) => {
  const { appliquer } = job.payload

  const corrections = await lireLesCorrections()

  output.log(
    `normaliser-les-telephones: ${corrections.length} téléphones à reprendre, ${appliquer ? 'application' : 'à blanc'}`,
  )

  if (appliquer) {
    await enregistrerToutes(corrections)
  }

  const fichier = deposerLeReleve(
    corrections.map((correction) => ligne(correction, appliquer)),
  )

  return {
    appliquer,
    aCorriger: corrections.filter(({ normalise }) => normalise !== null).length,
    aEffacer: corrections.filter(({ normalise }) => normalise === null).length,
    releve: fichier,
  }
}
