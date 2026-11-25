import { type Acteur, peutGerer } from '../../../../domain'
import type { TagAffiche } from '../../../../ui/presenters/tag-affiche.presenter'
import { tagAffiche } from '../../../../ui/presenters/tag-affiche.presenter'
import type { ListeDesTags } from '../../domain'

export type LigneDeLaListe = {
  readonly tag: TagAffiche
  readonly accompagnements: number
  readonly gerable: boolean
}

export const lignesDeLaListe = (
  acteur: Acteur,
  liste: ListeDesTags,
): readonly LigneDeLaListe[] =>
  liste.items.map(({ tag, accompagnements }) => ({
    tag: tagAffiche(acteur)(tag),
    accompagnements,
    gerable: peutGerer(acteur)(tag.portee),
  }))
