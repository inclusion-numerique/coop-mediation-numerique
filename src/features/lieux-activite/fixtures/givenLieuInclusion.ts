import { v4 } from 'uuid'
import type { Prisma } from '@/generated/prisma/client'

export const givenLieuInclusion = <
  T extends Partial<Prisma.LieuInclusionCreateInput> & {
    nom: string
    adresse: string
    commune: string
    codePostal: string
    codeInsee: string
    banId: string
  },
>(
  data: T,
): Omit<T, 'id'> & {
  id: string
} => {
  const { id, ...rest } = data

  const givenId = id ?? v4()

  return {
    id: givenId,
    ...rest,
  } satisfies Prisma.LieuInclusionCreateInput
}
