import { prismaClient } from '@/configuration/prisma/prismaClient'
import { crasDeDemonstration, type ReferencesDesCras } from './activites'
import { upsertCraFixtures } from './upsertCraFixtures'

const duMediateur =
  (mediateurId: string) =>
  ({ activite }: { activite: { mediateurId?: string | null } }) =>
    activite.mediateurId === mediateurId

export const semerLesCrasDeDemonstration =
  (references: ReferencesDesCras) => (mediateurId: string) => {
    const cras = crasDeDemonstration(references)

    return upsertCraFixtures({
      transaction: prismaClient,
      crasIndividuels: cras.crasIndividuels.filter(duMediateur(mediateurId)),
      crasDemarchesAdministratives: cras.crasDemarchesAdministratives.filter(
        duMediateur(mediateurId),
      ),
      crasCollectifs: cras.crasCollectifs.filter(duMediateur(mediateurId)),
    })
  }
