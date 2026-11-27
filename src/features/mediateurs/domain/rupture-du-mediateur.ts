import { failure, type Result, success } from '@/libraries/result'
import {
  AucuneRuptureEnAttente,
  type EchecDeLaRuptureDuMediateur,
  MediateurIntrouvable,
} from './errors'
import type { MediateurId } from './mediateur-id'
import type { MediateurEtContrats } from './ports'
import { type RuptureEnAttente, ruptureEnAttente } from './rupture-en-attente'

export type RuptureDuMediateur = {
  readonly mediateur: MediateurEtContrats
  readonly rupture: RuptureEnAttente
}

export const ruptureDuMediateur = ({
  mediateurId,
  mediateur,
  maintenant,
}: {
  readonly mediateurId: MediateurId
  readonly mediateur: MediateurEtContrats | null
  readonly maintenant: Date
}): Result<RuptureDuMediateur, EchecDeLaRuptureDuMediateur> => {
  if (mediateur === null) return failure(MediateurIntrouvable(mediateurId))

  const rupture = ruptureEnAttente({
    contrats: mediateur.contrats,
    visibiliteChoisieLe: mediateur.visibiliteChoisieLe,
    maintenant,
  })

  return rupture === null
    ? failure(AucuneRuptureEnAttente(mediateurId))
    : success({ mediateur, rupture })
}
