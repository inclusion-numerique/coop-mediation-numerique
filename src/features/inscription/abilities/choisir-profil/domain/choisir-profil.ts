import {
  InscriptionFlowType,
  type InscriptionStep,
  prochaineEtape,
  type Role,
} from '@/features/inscription/domain'
import type { GetInscriptionEtat } from '@/features/inscription/domain/ports'
import { type Result, success } from '@/libraries/result'
import {
  type ChoisirProfilError,
  deciderLeRole,
  type RoleChoisi,
} from './decider-le-role'
import type { EnregistrerProfilChoisi } from './ports'

export type ChoisirProfilPorts = {
  readonly lireLEtat: GetInscriptionEtat
  readonly enregistrerProfilChoisi: EnregistrerProfilChoisi
}

export const choisirProfil =
  ({ lireLEtat, enregistrerProfilChoisi }: ChoisirProfilPorts) =>
  async (
    { userId, role }: RoleChoisi,
    maintenant: Date,
  ): Promise<
    Result<
      { readonly role: Role; readonly etapeSuivante: InscriptionStep },
      ChoisirProfilError
    >
  > => {
    const decision = deciderLeRole(
      await lireLEtat(userId),
      { userId, role },
      maintenant,
    )

    if (!decision.success) return decision

    await enregistrerProfilChoisi(decision.data.aEnregistrer)

    return success({
      role: decision.data.role,
      etapeSuivante: prochaineEtape(decision.data.aEnregistrer.etat, {
        flowType: InscriptionFlowType('withoutDataspace'),
        hasLieuxActivite: false,
      }),
    })
  }
