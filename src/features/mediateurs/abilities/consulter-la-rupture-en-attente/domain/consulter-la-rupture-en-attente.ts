import {
  type MediateurId,
  type RuptureEnAttente,
  ruptureDuMediateur,
} from '@/features/mediateurs/domain'
import { type Result, success } from '@/libraries/result'
import type { EchecDeConsulterLaRuptureEnAttente } from './errors'
import type { ConsulterLaRuptureEnAttentePorts } from './ports'

export const consulterLaRuptureEnAttente =
  ({ lireMediateurEtContrats }: ConsulterLaRuptureEnAttentePorts) =>
  async ({
    mediateurId,
    maintenant,
  }: {
    readonly mediateurId: MediateurId
    readonly maintenant: Date
  }): Promise<Result<RuptureEnAttente, EchecDeConsulterLaRuptureEnAttente>> => {
    const enAttente = ruptureDuMediateur({
      mediateurId,
      mediateur: await lireMediateurEtContrats(mediateurId),
      maintenant,
    })

    return enAttente.success ? success(enAttente.data.rupture) : enAttente
  }
