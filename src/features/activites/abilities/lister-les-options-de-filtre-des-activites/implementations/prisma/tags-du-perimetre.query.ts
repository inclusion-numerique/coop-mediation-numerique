import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { PerimetreDesStatistiques } from '../../../../domain'
import { dansLePerimetre } from '../../../../implementations/prisma/statistiques/perimetre-des-statistiques.sql'

const TAGS_LES_PLUS_UTILISES = 10

export const tagsLesPlusUtilisesDuPerimetre = (
  perimetre: PerimetreDesStatistiques,
): Promise<readonly { readonly id: string; readonly nom: string }[]> =>
  prismaClient.$queryRaw<{ id: string; nom: string }[]>`
    SELECT t.id::text AS id, t.nom
    FROM activites act
      INNER JOIN activite_tags at ON at.activite_id = act.id
      INNER JOIN tags t ON t.id = at.tag_id
    WHERE act.suppression IS NULL
      AND t.suppression IS NULL
      AND ${dansLePerimetre(perimetre)}
    GROUP BY t.id, t.nom
    ORDER BY COUNT(*) DESC, t.nom ASC
    LIMIT ${TAGS_LES_PLUS_UTILISES}`
