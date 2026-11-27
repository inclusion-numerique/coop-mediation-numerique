import { prismaClient } from '@/configuration/prisma'
import { tagToDomain } from '../../../../implementations/prisma/tag.transfer'
import type { LireLesTagsDeLaFusion } from '../../domain/ports'

export const lireLesTagsDeLaFusion: LireLesTagsDeLaFusion = async ({
  sourceId,
  destinationId,
}) => {
  const [source, destination] = await Promise.all([
    prismaClient.tag.findFirst({ where: { id: sourceId, suppression: null } }),
    prismaClient.tag.findFirst({
      where: { id: destinationId, suppression: null },
    }),
  ])
  return {
    source: source === null ? null : tagToDomain(source),
    destination: destination === null ? null : tagToDomain(destination),
  }
}
