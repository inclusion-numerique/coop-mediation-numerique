import type { UtilisateurId } from '@/features/inscription/domain'
import { type Result, success } from '@/libraries/result'
import type { EchecDeValider } from './errors'
import type { ValiderPorts } from './ports'
import {
  type ValidationAEnregistrer,
  validerInscription,
} from './valider-inscription'

export const valider =
  ({
    lireFaitsInscription,
    enregistrerValidation,
    inscrireALaListeDeDiffusion,
    effetsApresValidation,
  }: ValiderPorts) =>
  async ({
    userId,
    maintenant,
  }: {
    readonly userId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<ValidationAEnregistrer, EchecDeValider>> => {
    const validation = validerInscription({
      faits: await lireFaitsInscription(userId),
      maintenant,
    })

    if (!validation.success) return validation

    await enregistrerValidation(validation.data)
    await inscrireALaListeDeDiffusion(userId)
    await effetsApresValidation(userId)

    return success(validation.data)
  }
