import { type Acteur, peutGerer } from '../../../domain'
import type { TagAffiche } from '../../../ui/tag-affiche'
import { tagAffiche } from '../../../ui/tag-affiche.presenter'
import type { ListeDesTags } from '../domain'

export type LigneDeLaListe = {
  readonly tag: TagAffiche
  readonly accompagnements: number
  readonly gerable: boolean
}

export const lignesDeLaListe = (
  acteur: Acteur,
  liste: ListeDesTags,
): readonly LigneDeLaListe[] =>
  liste.tags.map(({ tag, accompagnements }) => ({
    tag: tagAffiche(acteur)(tag),
    accompagnements,
    gerable: peutGerer(acteur)(tag.portee),
  }))

export const nombreDePages = (total: number, lignesParPage: number): number =>
  lignesParPage > 0 ? Math.ceil(total / lignesParPage) : 1
