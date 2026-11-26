import {
  prochaineEtape,
  type Role,
  TypeDeParcours,
  type UtilisateurId,
} from '@/features/inscription/domain'
import { type Result, success } from '@/libraries/result'
import { deciderLeRole } from './decider-le-role'
import type { EchecDeChoisirProfil } from './errors'
import type { ChoisirProfilPorts } from './ports'
import type { ProfilChoisi } from './profil-choisi'

export const choisirProfil =
  ({ lireLEtat, enregistrerProfilChoisi }: ChoisirProfilPorts) =>
  async ({
    userId,
    role,
    maintenant,
  }: {
    readonly userId: UtilisateurId
    readonly role: Role
    readonly maintenant: Date
  }): Promise<Result<ProfilChoisi, EchecDeChoisirProfil>> => {
    const aEnregistrer = deciderLeRole({
      etat: await lireLEtat(userId),
      userId,
      role,
      maintenant,
    })

    if (!aEnregistrer.success) return aEnregistrer

    await enregistrerProfilChoisi(aEnregistrer.data)

    return success({
      role,
      etapeSuivante: prochaineEtape(aEnregistrer.data.etat, {
        flowType: TypeDeParcours('withoutDataspace'),
        hasLieuxActivite: false,
      }),
      aEnregistrer: aEnregistrer.data,
    })
  }
