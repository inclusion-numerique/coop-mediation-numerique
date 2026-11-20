import { prismaClient } from '@/configuration/prisma/prismaClient'
import {
  fixtureCrasCollectifs,
  fixtureCrasDemarchesAdministratives,
  fixtureCrasIndividuels,
} from './activites'
import { upsertCraFixtures } from './upsertCraFixtures'

const duMediateur =
  (mediateurId: string) =>
  ({ activite }: { activite: { mediateurId?: string | null } }) =>
    activite.mediateurId === mediateurId

export const semerLesCrasDeDemonstration = (mediateurId: string) =>
  upsertCraFixtures({
    transaction: prismaClient,
    crasIndividuels: fixtureCrasIndividuels.filter(duMediateur(mediateurId)),
    crasDemarchesAdministratives: fixtureCrasDemarchesAdministratives.filter(
      duMediateur(mediateurId),
    ),
    crasCollectifs: fixtureCrasCollectifs.filter(duMediateur(mediateurId)),
  })
