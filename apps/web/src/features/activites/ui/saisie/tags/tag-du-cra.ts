import type {
  EquipeDuTag,
  PorteeDuTag,
} from '@app/web/features/activites/ui/tags/BadgeDePortee'

export type TagDuCra = {
  readonly id: string
  readonly nom: string
  readonly description: string | null
  readonly portee: PorteeDuTag
  readonly equipe: EquipeDuTag | null
}

export type Tag = {
  id: string
  nom: string
  description?: string
  portee: PorteeDuTag
  equipe: EquipeDuTag | null
}

export const tagDuFormulaire = (tag: TagDuCra): Tag => ({
  id: tag.id,
  nom: tag.nom,
  description: tag.description ?? undefined,
  portee: tag.portee,
  equipe: tag.equipe,
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
