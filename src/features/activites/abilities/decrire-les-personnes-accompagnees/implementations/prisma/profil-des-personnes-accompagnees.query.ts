import { prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import {
  Effectif,
  genres,
  repartitionComplete,
  statutsSociaux,
  type TRANCHES_D_AGE,
  tranchesDAge,
} from '../../../../domain'
import {
  type DemandeDeStatistiques,
  personneAccompagnee,
} from '../../../../implementations/prisma/statistiques/statistiques.sql'
import { valeurEnBase } from '../../../../implementations/prisma/valeur-en-base.transfer'
import type { ProfilDesPersonnesAccompagnees } from '../../domain'

const PREMIERE_ANNEE_DE_NAISSANCE = 1900

const AGE_AVANT_LA_TRANCHE_SUIVANTE = [
  { tranche: 'MoinsDeDouze', avant: 12 },
  { tranche: 'DouzeDixHuit', avant: 18 },
  { tranche: 'DixHuitVingtQuatre', avant: 25 },
  { tranche: 'VingtCinqTrenteNeuf', avant: 40 },
  { tranche: 'QuaranteCinquanteNeuf', avant: 60 },
  { tranche: 'SoixanteSoixanteNeuf', avant: 70 },
] as const satisfies readonly {
  readonly tranche: (typeof TRANCHES_D_AGE)[number]
  readonly avant: number
}[]

const TRANCHE_DES_PLUS_AGES =
  'SoixanteDixPlus' satisfies (typeof TRANCHES_D_AGE)[number]

type Ligne = {
  readonly total: number
  readonly genres: readonly number[]
  readonly tranches_d_age: readonly number[]
  readonly statuts_sociaux: readonly number[]
}

const NON_COMMUNIQUE = valeurEnBase('NonCommunique')

const age = Prisma.sql`(EXTRACT(YEAR FROM CURRENT_DATE) - ben.annee_naissance)`

const trancheDAgeDerivee = Prisma.sql`COALESCE(
  CASE
    WHEN ben.annee_naissance IS NULL
      OR ben.annee_naissance < ${PREMIERE_ANNEE_DE_NAISSANCE}
      OR ben.annee_naissance > EXTRACT(YEAR FROM CURRENT_DATE) THEN NULL
    ${Prisma.join(
      AGE_AVANT_LA_TRANCHE_SUIVANTE.map(
        ({ tranche, avant }) =>
          Prisma.sql`WHEN ${age} < ${avant} THEN ${valeurEnBase(tranche)}`,
      ),
      ' ',
    )}
    ELSE ${valeurEnBase(TRANCHE_DES_PLUS_AGES)}
  END,
  ben.tranche_age::text,
  ${NON_COMMUNIQUE}
)`

const parValeur = (
  colonne: Prisma.Sql,
  valeurs: readonly string[],
): Prisma.Sql =>
  Prisma.sql`ARRAY[${Prisma.join(
    valeurs.map(
      (valeur) =>
        Prisma.sql`COALESCE(SUM(nombre) FILTER (WHERE ${colonne} = ${valeurEnBase(valeur)}), 0)`,
    ),
  )}]::int[]`

export const decrireLesPersonnesAccompagnees = async (
  demande: DemandeDeStatistiques,
): Promise<ProfilDesPersonnesAccompagnees> => {
  const [ligne] = await prismaClient.$queryRaw<Ligne[]>`
    WITH personnes AS (
      SELECT
        COALESCE(ben.genre::text, ${NON_COMMUNIQUE}) AS genre,
        ${trancheDAgeDerivee} AS tranche_d_age,
        COALESCE(ben.statut_social::text, ${NON_COMMUNIQUE}) AS statut_social,
        COUNT(*) AS nombre
      FROM beneficiaires ben
      WHERE ${personneAccompagnee(demande)}
      GROUP BY 1, 2, 3
    )
    SELECT
      COALESCE(SUM(nombre), 0)::int AS total,
      ${parValeur(Prisma.sql`genre`, genres)} AS genres,
      ${parValeur(Prisma.sql`tranche_d_age`, tranchesDAge)} AS tranches_d_age,
      ${parValeur(Prisma.sql`statut_social`, statutsSociaux)} AS statuts_sociaux
    FROM personnes`
  return {
    total: Effectif(ligne?.total ?? 0),
    genres: repartitionComplete(genres, ligne?.genres ?? []),
    tranchesDAge: repartitionComplete(
      tranchesDAge,
      ligne?.tranches_d_age ?? [],
    ),
    statutsSociaux: repartitionComplete(
      statutsSociaux,
      ligne?.statuts_sociaux ?? [],
    ),
  }
}
