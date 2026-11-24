import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { TagId } from '../../../../domain'

export const tagsChoisis = async (
  ids: readonly TagId[],
): Promise<readonly { readonly id: string; readonly nom: string }[]> =>
  ids.length === 0
    ? []
    : prismaClient.tag.findMany({
        where: { id: { in: [...ids] } },
        select: { id: true, nom: true },
        orderBy: { nom: 'asc' },
      })
