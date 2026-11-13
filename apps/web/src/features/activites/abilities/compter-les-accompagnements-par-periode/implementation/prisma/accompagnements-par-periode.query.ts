import { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import {
  activitesRetenues,
  type DemandeDeStatistiques,
  jointuresDesStatistiques,
} from '../../../../db/statistiques.sql'
import { Effectif, Jour } from '../../../../domain'
import {
  type AccompagnementsParPeriode,
  type BornesDeLaSerie,
  type FenetreDesGraphiques,
  joursDeLaFenetre,
  Mois,
  moisDeLaFenetre,
} from '../../domain'

type Ligne = { readonly periode: string; readonly nombre: number }

const serie = (
  demande: DemandeDeStatistiques,
  { du, au }: BornesDeLaSerie,
  pas: Prisma.Sql,
  format: string,
): Promise<Ligne[]> =>
  prismaClient.$queryRaw<Ligne[]>`
    WITH accompagnements_retenus AS (
      SELECT DATE_TRUNC(${pas}, act.date::timestamp) AS periode
      FROM activites act
        INNER JOIN accompagnements acc ON acc.activite_id = act.id
        ${jointuresDesStatistiques(demande.criteres)}
      WHERE ${activitesRetenues(demande)}
        AND act.date BETWEEN ${du}::date AND ${au}::date
    ),
    periodes AS (
      SELECT generate_series(
        DATE_TRUNC(${pas}, ${du}::date::timestamp),
        ${au}::date::timestamp,
        ('1 ' || ${pas})::interval
      ) AS periode
    )
    SELECT TO_CHAR(periodes.periode, ${format}) AS periode,
           COUNT(accompagnements_retenus.periode)::int AS nombre
    FROM periodes
      LEFT JOIN accompagnements_retenus
        ON accompagnements_retenus.periode = periodes.periode
    GROUP BY periodes.periode
    ORDER BY periodes.periode`

export const compterLesAccompagnementsParPeriode = async ({
  parJour,
  parMois,
  ...demande
}: DemandeDeStatistiques & {
  readonly parJour: FenetreDesGraphiques
  readonly parMois: FenetreDesGraphiques
}): Promise<AccompagnementsParPeriode> => {
  const [jours, mois] = await Promise.all([
    serie(demande, joursDeLaFenetre(parJour), Prisma.sql`'day'`, 'YYYY-MM-DD'),
    serie(demande, moisDeLaFenetre(parMois), Prisma.sql`'month'`, 'YYYY-MM'),
  ])
  return {
    parJour: jours.map(({ periode, nombre }) => ({
      jour: Jour(periode),
      nombre: Effectif(nombre),
    })),
    parMois: mois.map(({ periode, nombre }) => ({
      mois: Mois(periode),
      nombre: Effectif(nombre),
    })),
  }
}
