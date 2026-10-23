import type { ActeurId } from './acteur-id'

export type ActeurIntrouvable = {
  readonly _tag: 'ActeurIntrouvable'
  readonly acteurId: ActeurId
}

export const ActeurIntrouvable = (acteurId: ActeurId): ActeurIntrouvable => ({
  _tag: 'ActeurIntrouvable',
  acteurId,
})
