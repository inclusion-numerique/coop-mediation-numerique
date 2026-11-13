import { prismaClient } from '@app/web/prismaClient'
import {
  activitesRetenues,
  type DemandeDeStatistiques,
  jointuresDesStatistiques,
} from '../../../../db/statistiques.sql'
import { Effectif, LieuActiviteId, NomDeStructure } from '../../../../domain'
import type { AccompagnementsParLieu } from '../../domain'

type Ligne = {
  readonly id: string
  readonly nom: string
  readonly nombre: number
}

export const compterLesAccompagnementsParLieu = async (
  demande: DemandeDeStatistiques,
): Promise<AccompagnementsParLieu> =>
  (
    await prismaClient.$queryRaw<Ligne[]>`
      SELECT str.id::text AS id, str.nom, COUNT(*)::int AS nombre
      FROM activites act
        INNER JOIN accompagnements acc ON acc.activite_id = act.id
        ${jointuresDesStatistiques(demande.criteres, { avecLeLieu: true })}
      WHERE str.id IS NOT NULL
        AND ${activitesRetenues(demande)}
      GROUP BY str.id, str.nom
      ORDER BY nombre DESC, str.nom ASC, str.id ASC`
  ).map(({ id, nom, nombre }) => ({
    lieu: { id: LieuActiviteId(id), nom: NomDeStructure(nom) },
    nombre: Effectif(nombre),
  }))
