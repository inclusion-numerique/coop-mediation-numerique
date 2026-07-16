import {
  InscriptionFlowType,
  type InscriptionStep,
  prochaineEtape,
  type Role,
} from '@app/web/features/inscription/domain'
import { type Result, success } from '@app/web/libraries/result'
import {
  type ChoisirProfilError,
  choisirProfil as deciderRole,
  type RoleChoisi,
} from '../domain/choisir-profil'
import { enregistrerProfilChoisi, getInscriptionEtat } from '../implementation'

/**
 * Cas d'usage « choisir un rôle » : lit l'état courant, délègue la décision au
 * domaine (pur), projette la charge décidée en une seule écriture, puis rend la
 * position de reprise (`prochaineEtape`) — la navigation dérive ainsi de l'état
 * persisté, pas d'un contexte recalculé côté client. Toute l'orchestration à
 * effets vit ici ; le domaine reste pur et testé par valeur, ce use case est
 * couvert en intégration (BDD) sur la vraie infra.
 */
export const choisirProfil = async (
  { userId, role }: RoleChoisi,
  maintenant: Date,
): Promise<
  Result<
    { readonly role: Role; readonly etapeSuivante: InscriptionStep },
    ChoisirProfilError
  >
> => {
  const decision = deciderRole(
    await getInscriptionEtat(userId),
    { userId, role },
    maintenant,
  )

  if (!decision.success) return decision

  await enregistrerProfilChoisi(decision.data.aEnregistrer)

  // Un conseiller numérique ne franchit jamais `choisir-role` (routé avant, à
  // l'initialisation) : à cet écran le contexte Dataspace est inerte.
  const etapeSuivante = prochaineEtape(decision.data.aEnregistrer.etat, {
    flowType: InscriptionFlowType('withoutDataspace'),
    hasLieuxActivite: false,
  })

  return success({ role: decision.data.role, etapeSuivante })
}
