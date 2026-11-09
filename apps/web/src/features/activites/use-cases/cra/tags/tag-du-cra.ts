import { TagScope } from '../../tags/tagScope'

export type PorteeDuTagDuCra =
  | 'Personnel'
  | 'Equipe'
  | 'Departemental'
  | 'National'

export type TagDuCra = {
  readonly id: string
  readonly nom: string
  readonly description: string | null
  readonly portee: PorteeDuTagDuCra
  readonly equipe: {
    readonly numero: number
    readonly coordonneePar: string
  } | null
}

export type Tag = {
  id: string
  nom: string
  description?: string
  scope: TagScope
  equipeNumber?: number
  equipeCoordinateurNom?: string
}

const SCOPE: Record<PorteeDuTagDuCra, TagScope> = {
  Personnel: TagScope.Personnel,
  Equipe: TagScope.Equipe,
  Departemental: TagScope.Departemental,
  National: TagScope.National,
}

export const tagDuFormulaire = (tag: TagDuCra): Tag => ({
  id: tag.id,
  nom: tag.nom,
  description: tag.description ?? undefined,
  scope: SCOPE[tag.portee],
  equipeNumber: tag.equipe?.numero,
  equipeCoordinateurNom: tag.equipe?.coordonneePar,
})

export type VisibiliteDuTagDuCra =
  | { readonly _tag: 'Personnel' }
  | {
      readonly _tag: 'Equipe'
      readonly coordinateurId: string
      readonly numero: number | null
      readonly coordonneePar: string
    }
  | { readonly _tag: 'Departemental' }

export type RechercherDesTagsInitiaux = (
  exclus: readonly string[],
) => Promise<readonly TagDuCra[]>
