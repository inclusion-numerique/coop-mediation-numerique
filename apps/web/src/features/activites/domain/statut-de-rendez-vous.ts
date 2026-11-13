import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const STATUTS_DE_RENDEZ_VOUS = [
  'AVenir',
  'Passe',
  'Honore',
  'Annule',
  'AnnuleParLeBeneficiaire',
  'Absent',
] as const

export const StatutDeRendezVous = defineModel(
  z.enum(STATUTS_DE_RENDEZ_VOUS).brand('StatutDeRendezVous'),
)

export type StatutDeRendezVous = Model.TypeOf<typeof StatutDeRendezVous>
