import { prismaClient } from '@app/web/prismaClient'
import {
  activitesRetenues,
  type DemandeDeStatistiques,
  jointuresDesStatistiques,
} from '../../../../db/statistiques.sql'
import { communeComptee, Effectif } from '../../../../domain'
import type { PersonnesParCommune } from '../../domain'
import { premierCodePostal } from './premier-code-postal'

type Ligne = {
  readonly nom: string | null
  readonly code_postal: string | null
  readonly code_insee: string | null
  readonly nombre: number
}

export const compterLesPersonnesAccompagneesParCommune = async (
  demande: DemandeDeStatistiques,
): Promise<PersonnesParCommune> =>
  (
    await prismaClient.$queryRaw<Ligne[]>`
      SELECT
        MIN(NULLIF(btrim(ben.commune), '')) AS nom,
        MIN(NULLIF(btrim(ben.commune_code_postal), '')) AS code_postal,
        ben.commune_code_insee AS code_insee,
        COUNT(DISTINCT ben.id)::int AS nombre
      FROM activites act
        INNER JOIN accompagnements acc ON acc.activite_id = act.id
        INNER JOIN beneficiaires ben ON ben.id = acc.beneficiaire_id
        ${jointuresDesStatistiques(demande.criteres)}
      WHERE ${activitesRetenues(demande)}
      GROUP BY ben.commune_code_insee
      ORDER BY nombre DESC, nom ASC NULLS LAST, code_insee ASC NULLS LAST`
  ).map(({ nom, code_postal, code_insee, nombre }) => ({
    commune: communeComptee({
      nom,
      codePostal: premierCodePostal(code_postal),
      codeInsee: code_insee,
    }),
    nombre: Effectif(nombre),
  }))
