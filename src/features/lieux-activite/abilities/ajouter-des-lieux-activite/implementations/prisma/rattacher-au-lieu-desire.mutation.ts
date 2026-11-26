import type { Prisma } from '@/generated/prisma/client'
import type { LieuCarto } from '../../domain'
import {
  type LieuDesire,
  lieuDemandeDepuisLeLieuDesire,
} from './lieu-desire.transfer'
import { rattacherAuLieu } from './rattacher-au-lieu.mutation'

export const rattacherAuLieuDesire = (
  transaction: Prisma.TransactionClient,
  {
    userId,
    lieu,
    structuresCartoParId,
    maintenant,
  }: {
    readonly userId: string
    readonly lieu: LieuDesire
    readonly structuresCartoParId: ReadonlyMap<string, LieuCarto>
    readonly maintenant: Date
  },
) =>
  rattacherAuLieu(transaction, {
    userId,
    lieu: lieuDemandeDepuisLeLieuDesire(lieu),
    structuresCartoParId,
    maintenant,
  })
