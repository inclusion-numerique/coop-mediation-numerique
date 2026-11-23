import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { AuteurSuppression } from './auteur-suppression'
import type { NomRetentionPolicy } from './retention-policy'

const motifsSuppression = [
  'DemandeDuTitulaire',
  'DecisionAdministrateur',
  'InactiviteApresInscription',
  'InactiviteProlongee',
] as const

export const MotifSuppression = defineModel(
  z.enum(motifsSuppression).brand('MotifSuppression'),
)
export type MotifSuppression = Model.TypeOf<typeof MotifSuppression>

const MOTIF_PAR_AUTEUR: Record<
  Exclude<AuteurSuppression['_tag'], 'systeme'>,
  MotifSuppression
> = {
  titulaire: MotifSuppression('DemandeDuTitulaire'),
  administrateur: MotifSuppression('DecisionAdministrateur'),
}

const MOTIF_PAR_POLICY: Record<NomRetentionPolicy, MotifSuppression> = {
  InscritJamaisActif: MotifSuppression('InactiviteApresInscription'),
  InactifDepuisDeuxAns: MotifSuppression('InactiviteProlongee'),
}

const motifDeLaPolicy = (policy: NomRetentionPolicy): MotifSuppression =>
  MOTIF_PAR_POLICY[policy]

export const motifDe = (auteur: AuteurSuppression): MotifSuppression =>
  auteur._tag === 'systeme'
    ? motifDeLaPolicy(auteur.policy)
    : MOTIF_PAR_AUTEUR[auteur._tag]
