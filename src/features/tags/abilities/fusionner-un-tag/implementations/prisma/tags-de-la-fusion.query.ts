import { lireUnTagActif } from '../../../../implementations/prisma/tag-actif.query'
import type { LireLesTagsDeLaFusion } from '../../domain/fusionner-un-tag'

export const lireLesTagsDeLaFusion: LireLesTagsDeLaFusion = async ({
  sourceId,
  destinationId,
}) => {
  const [source, destination] = await Promise.all([
    lireUnTagActif(sourceId),
    lireUnTagActif(destinationId),
  ])
  return { source, destination }
}
