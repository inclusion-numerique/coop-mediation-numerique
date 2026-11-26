import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const SEUIL_INACTIVITE_EN_JOURS = 30

type DerniereActivite =
  | { readonly type: 'Aucune' }
  | { readonly type: 'Le'; readonly date: Date }

export type StatutMembre =
  | { readonly type: 'Invitation'; readonly envoyeeLe: Date }
  | { readonly type: 'Actif'; readonly derniereActivite: Date }
  | { readonly type: 'Inactif'; readonly derniereActivite: DerniereActivite }
  | {
      readonly type: 'AncienMembre'
      readonly depuis: Date
      readonly jusquA: Date
    }
  | { readonly type: 'ProfilSupprime'; readonly le: Date }

export const TypeDeStatut = defineModel(
  z
    .string()
    .pipe(
      z.enum([
        'Invitation',
        'Actif',
        'Inactif',
        'AncienMembre',
        'ProfilSupprime',
      ]),
    )
    .brand('TypeDeStatut'),
)

export type TypeDeStatut = Model.TypeOf<typeof TypeDeStatut>
