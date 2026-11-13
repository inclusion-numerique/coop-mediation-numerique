import { prismaClient } from '@app/web/prismaClient'
import {
  activitesRetenues,
  type DemandeDeStatistiques,
  jointuresDesStatistiques,
} from '../../../../db/statistiques.sql'
import { communeComptee, Effectif } from '../../../../domain'
import type { AccompagnementsParCommune } from '../../domain'

type Ligne = {
  readonly nom: string | null
  readonly code_postal: string | null
  readonly code_insee: string | null
  readonly nombre: number
}

export const compterLesAccompagnementsParCommune = async (
  demande: DemandeDeStatistiques,
): Promise<AccompagnementsParCommune> =>
  (
    await prismaClient.$queryRaw<Ligne[]>`
      SELECT
        MIN(NULLIF(btrim(COALESCE(str.commune, act.lieu_commune)), '')) AS nom,
        MIN(NULLIF(btrim(COALESCE(str.code_postal, act.lieu_code_postal)), '')) AS code_postal,
        COALESCE(str.code_insee, act.lieu_code_insee) AS code_insee,
        COUNT(*)::int AS nombre
      FROM activites act
        INNER JOIN accompagnements acc ON acc.activite_id = act.id
        ${jointuresDesStatistiques(demande.criteres, { avecLeLieu: true })}
      WHERE ${activitesRetenues(demande)}
      GROUP BY COALESCE(str.code_insee, act.lieu_code_insee)
      ORDER BY nombre DESC`
  ).map(({ nom, code_postal, code_insee, nombre }) => ({
    commune: communeComptee({
      nom,
      codePostal: code_postal,
      codeInsee: code_insee,
    }),
    nombre: Effectif(nombre),
  }))
