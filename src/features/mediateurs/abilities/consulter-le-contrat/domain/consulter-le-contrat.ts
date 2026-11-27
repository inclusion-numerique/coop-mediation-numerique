import type { UtilisateurId } from '@/features/mediateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { type Contrat, dernierContrat } from './contrat'
import { AucunContrat, type EchecDeConsulterLeContrat } from './errors'
import type { ConsulterLeContratPorts } from './ports'

export const consulterLeContrat =
  ({ lireLesContrats }: ConsulterLeContratPorts) =>
  async ({
    utilisateurId,
    maintenant,
  }: {
    readonly utilisateurId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<Contrat, EchecDeConsulterLeContrat>> => {
    const contrat = dernierContrat(
      await lireLesContrats(utilisateurId),
      maintenant,
    )

    return contrat === null ? failure(AucunContrat()) : success(contrat)
  }
