import { prismaClient } from '@/configuration/prisma/prisma-client'
import {
  crasDeDemonstration,
  type ReferencesDesCras,
} from './cras-de-demonstration'
import { enregistrerLesCras } from './enregistrer-les-cras'

const duMediateur =
  (mediateurId: string) =>
  ({ activite }: { activite: { mediateurId?: string | null } }) =>
    activite.mediateurId === mediateurId

export const semerLesCrasDeDemonstration =
  (references: ReferencesDesCras) => (mediateurId: string) => {
    const cras = crasDeDemonstration(references)

    return enregistrerLesCras({
      transaction: prismaClient,
      crasIndividuels: cras.crasIndividuels.filter(duMediateur(mediateurId)),
      crasDemarchesAdministratives: cras.crasDemarchesAdministratives.filter(
        duMediateur(mediateurId),
      ),
      crasCollectifs: cras.crasCollectifs.filter(duMediateur(mediateurId)),
    })
  }
