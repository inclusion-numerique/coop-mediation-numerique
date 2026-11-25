import type { UtilisateurId } from '@/features/inscription/domain'
import { type Result, success } from '@/libraries/result'
import type {
  EffetsApresValidation,
  EnregistrerValidation,
  InscrireALaListeDeDiffusion,
  LireFaitsInscription,
} from './ports'
import {
  validerInscription as deciderLaValidation,
  type ValiderInscriptionError,
} from './valider-inscription'

export type ValiderPorts = {
  readonly lireFaitsInscription: LireFaitsInscription
  readonly enregistrerValidation: EnregistrerValidation
  readonly inscrireALaListeDeDiffusion: InscrireALaListeDeDiffusion
  readonly effetsApresValidation: EffetsApresValidation
}

export const valider =
  ({
    lireFaitsInscription,
    enregistrerValidation,
    inscrireALaListeDeDiffusion,
    effetsApresValidation,
  }: ValiderPorts) =>
  async (
    userId: UtilisateurId,
    maintenant: Date,
  ): Promise<Result<void, ValiderInscriptionError>> => {
    const decision = deciderLaValidation(
      await lireFaitsInscription(userId),
      maintenant,
    )

    if (!decision.success) return decision

    await enregistrerValidation({
      userId,
      aEnregistrer: decision.data.aEnregistrer,
    })
    await inscrireALaListeDeDiffusion(userId)
    await effetsApresValidation(userId)

    return success<void>(undefined)
  }
