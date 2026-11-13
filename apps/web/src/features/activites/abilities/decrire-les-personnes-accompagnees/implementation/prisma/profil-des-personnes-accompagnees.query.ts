import { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import {
  activitesRetenues,
  type DemandeDeStatistiques,
  jointuresDesStatistiques,
} from '../../../../db/statistiques.sql'
import { valeurEnBase } from '../../../../db/valeur-en-base'
import {
  Effectif,
  genres,
  repartitionComplete,
  statutsSociaux,
  tranchesDAge,
} from '../../../../domain'
import {
  AGE_AVANT_LA_TRANCHE_SUIVANTE,
  PREMIERE_ANNEE_DE_NAISSANCE,
  type ProfilDesPersonnesAccompagnees,
  TRANCHE_DES_PLUS_AGES,
} from '../../domain'

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
        Prisma.sql`COUNT(*) FILTER (WHERE ${colonne} = ${valeurEnBase(valeur)})`,
    ),
  )}]::int[]`

export const decrireLesPersonnesAccompagnees = async (
  demande: DemandeDeStatistiques,
): Promise<ProfilDesPersonnesAccompagnees> => {
  const [ligne] = await prismaClient.$queryRaw<Ligne[]>`
    WITH personnes AS (
      SELECT DISTINCT
        ben.id,
        COALESCE(ben.genre::text, ${NON_COMMUNIQUE}) AS genre,
        ${trancheDAgeDerivee} AS tranche_d_age,
        COALESCE(ben.statut_social::text, ${NON_COMMUNIQUE}) AS statut_social
      FROM activites act
        INNER JOIN accompagnements acc ON acc.activite_id = act.id
        INNER JOIN beneficiaires ben ON ben.id = acc.beneficiaire_id
        ${jointuresDesStatistiques(demande.criteres)}
      WHERE ${activitesRetenues(demande)}
    )
    SELECT
      COUNT(*)::int AS total,
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
