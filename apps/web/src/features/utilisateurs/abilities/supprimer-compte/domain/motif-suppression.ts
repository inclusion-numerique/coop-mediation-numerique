import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { AuteurSuppression } from './auteur-suppression'

export const motifsSuppression = [
  'DemandeDuTitulaire',
  'DecisionAdministrateur',
  'InactiviteApresInscription',
] as const

export const MotifSuppression = defineModel(
  z.enum(motifsSuppression).brand('MotifSuppression'),
)
export type MotifSuppression = Model.TypeOf<typeof MotifSuppression>

/**
 * Le motif se DÉDUIT de l'auteur, il ne se saisit pas (DM-5) : les porter tous
 * deux, ce serait deux champs pour un seul état, avec la possibilité de les
 * désaccorder — un effacement « demandé par le titulaire » attribué à un
 * administrateur.
 */
const MOTIF_PAR_AUTEUR: Record<AuteurSuppression['_tag'], MotifSuppression> = {
  titulaire: MotifSuppression('DemandeDuTitulaire'),
  administrateur: MotifSuppression('DecisionAdministrateur'),
  systeme: MotifSuppression('InactiviteApresInscription'),
}

export const motifDe = (auteur: AuteurSuppression): MotifSuppression =>
  MOTIF_PAR_AUTEUR[auteur._tag]
