import type { MediateurId } from '../../domain/mediateur-id'
import {
  type RuptureEnAttente,
  ruptureEnAttente,
} from '../../domain/rupture-en-attente'
import { lireMediateurEtContrats } from './mediateur-et-contrats'

export const lireLaRuptureEnAttente = async ({
  mediateurId,
  maintenant = new Date(),
}: {
  readonly mediateurId: MediateurId
  readonly maintenant?: Date
}): Promise<RuptureEnAttente | null> => {
  const mediateur = await lireMediateurEtContrats(mediateurId)

  return mediateur == null
    ? null
    : ruptureEnAttente({
        contrats: mediateur.contrats,
        visibiliteChoisieLe: mediateur.visibiliteChoisieLe,
        maintenant,
      })
}
