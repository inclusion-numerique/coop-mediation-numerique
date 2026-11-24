import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { UtilisateurId } from '../identifiants/utilisateur-id'

export const SourceCartographie = defineModel(
  z.string().trim().min(1).brand('SourceCartographie'),
)

export type SourceCartographie = Model.TypeOf<typeof SourceCartographie>

type Creation = {
  readonly date: Date
  readonly par: UtilisateurId | null
}

export type DerniereModification =
  | {
      readonly _tag: 'ParUtilisateur'
      readonly date: Date
      readonly par: UtilisateurId
    }
  | {
      readonly _tag: 'ParSource'
      readonly date: Date
      readonly source: SourceCartographie
    }
  | { readonly _tag: 'Inconnue'; readonly date: Date }

export const ModifieParUtilisateur = (
  date: Date,
  par: UtilisateurId,
): Extract<DerniereModification, { _tag: 'ParUtilisateur' }> => ({
  _tag: 'ParUtilisateur',
  date,
  par,
})

export const ModifieParSource = (
  date: Date,
  source: SourceCartographie,
): Extract<DerniereModification, { _tag: 'ParSource' }> => ({
  _tag: 'ParSource',
  date,
  source,
})

export const ModificationInconnue = (
  date: Date,
): Extract<DerniereModification, { _tag: 'Inconnue' }> => ({
  _tag: 'Inconnue',
  date,
})

export type Suppression =
  | { readonly _tag: 'Actif' }
  | {
      readonly _tag: 'Supprime'
      readonly date: Date
      readonly par: UtilisateurId | null
    }

export const Actif: Suppression = { _tag: 'Actif' }

export const Supprime = (
  date: Date,
  par: UtilisateurId | null,
): Suppression => ({
  _tag: 'Supprime',
  date,
  par,
})

export type Tracabilite = {
  readonly creation: Creation
  readonly derniereModification: DerniereModification
  readonly suppression: Suppression
}
