import { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import {
  activitesRetenues,
  type DemandeDeStatistiques,
  jointuresDesStatistiques,
} from '../../../../db/statistiques.sql'
import { Effectif, NomDeTag, TagId } from '../../../../domain'
import type { AccompagnementsParTag } from '../../domain'

type Ligne = {
  readonly id: string
  readonly nom: string
  readonly nombre: number
}

const tagsRetenus = ({ perimetre }: DemandeDeStatistiques): Prisma.Sql =>
  perimetre.type === 'National'
    ? Prisma.sql`t.suppression IS NULL AND t.mediateur_id IS NULL`
    : Prisma.sql`t.suppression IS NULL`

export const repartirLesAccompagnementsParTag = async (
  demande: DemandeDeStatistiques,
): Promise<AccompagnementsParTag> =>
  (
    await prismaClient.$queryRaw<Ligne[]>`
      SELECT t.id::text AS id, t.nom, COUNT(*)::int AS nombre
      FROM accompagnements acc
        INNER JOIN activites act ON acc.activite_id = act.id
        INNER JOIN activite_tags at ON at.activite_id = act.id
        INNER JOIN tags t ON t.id = at.tag_id
        ${jointuresDesStatistiques(demande.criteres)}
      WHERE ${tagsRetenus(demande)}
        AND ${activitesRetenues(demande)}
      GROUP BY t.id, t.nom
      ORDER BY nombre DESC, t.nom ASC`
  ).map(({ id, nom, nombre }) => ({
    tag: { id: TagId(id), nom: NomDeTag(nom) },
    nombre: Effectif(nombre),
  }))
