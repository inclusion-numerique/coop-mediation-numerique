import { z } from 'zod'
import type { SuggestionAffichee } from '../presenters/suggestion-de-lieu.presenter'
import type { LieuAuPanier } from './panier.form-data'

export type ValeursDuPanier = {
  lieux: LieuAuPanier[]
  recherche: SuggestionAffichee | null
}

export const PanierValidation = z
  .custom<ValeursDuPanier>()
  .refine((value) => value.lieux.length > 0, {
    message: 'Veuillez sélectionner au moins un lieu d’activité',
    path: ['lieux'],
  })
