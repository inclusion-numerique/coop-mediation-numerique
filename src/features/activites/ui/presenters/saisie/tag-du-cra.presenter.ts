import type {
  BadgeDuTag,
  TagDuCra,
} from '../../../action/rechercher-des-tags.key'

export type Tag = {
  id: string
  nom: string
  description?: string
  badge: BadgeDuTag
}

export const tagDuFormulaire = (tag: TagDuCra): Tag => ({
  id: tag.id,
  nom: tag.nom,
  ...(tag.description == null ? {} : { description: tag.description }),
  badge: tag.badge,
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

export const visibilitesDuCra = (
  visibilites: readonly VisibiliteDuTagDuCra[],
  { departemental }: { readonly departemental: boolean },
): readonly VisibiliteDuTagDuCra[] =>
  visibilites.filter(({ _tag }) => departemental || _tag !== 'Departemental')
