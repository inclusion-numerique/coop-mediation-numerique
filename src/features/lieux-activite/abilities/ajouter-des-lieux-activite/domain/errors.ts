import type { LieuIntrouvable, MediateurRequis } from '../../../domain/errors'

export type PanierVide = { readonly _tag: 'PanierVide' }

export const PanierVide = (): PanierVide => ({ _tag: 'PanierVide' })

export type AdresseNonValidee = {
  readonly _tag: 'AdresseNonValidee'
  readonly nom: string
}

export const AdresseNonValidee = (nom: string): AdresseNonValidee => ({
  _tag: 'AdresseNonValidee',
  nom,
})

export type EchecDeAjouterDesLieuxActivite =
  | MediateurRequis
  | PanierVide
  | AdresseNonValidee
  | LieuIntrouvable
