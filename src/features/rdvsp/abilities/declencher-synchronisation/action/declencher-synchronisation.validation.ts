import { z } from 'zod'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'

/**
 * L'identifiant de la cible traverse le réseau parce que l'administration
 * synchronise pour un tiers. Le droit de le faire n'est pas déduit de sa
 * présence : `peutDeclencherPour` le tranche côté domaine.
 */
export const DeclencherSynchronisationValidation = z.object({
  utilisateurId: UtilisateurCoopId.schema,
})
