import { prismaClient } from '@/configuration/prisma/prismaClient'
import { crasDeDemonstration, type LieuxDesCras } from './activites'
import { upsertCraFixtures } from './upsertCraFixtures'

const duMediateur =
  (mediateurId: string) =>
  ({ activite }: { activite: { mediateurId?: string | null } }) =>
    activite.mediateurId === mediateurId

export const semerLesCrasDeDemonstration =
  (lieux: LieuxDesCras) => (mediateurId: string) => {
    const cras = crasDeDemonstration(lieux)

    return upsertCraFixtures({
      transaction: prismaClient,
      crasIndividuels: cras.crasIndividuels.filter(duMediateur(mediateurId)),
      crasDemarchesAdministratives: cras.crasDemarchesAdministratives.filter(
        duMediateur(mediateurId),
      ),
      crasCollectifs: cras.crasCollectifs.filter(duMediateur(mediateurId)),
    })
  }
