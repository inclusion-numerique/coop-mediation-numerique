import type { Lieu } from './lieu'
import type { SectionDeLaFiche } from './section-de-la-fiche'

export type SectionsEnregistrees = {
  readonly _tag: 'Enregistree'
  readonly lieu: Lieu
  readonly sections: readonly SectionDeLaFiche[]
}
