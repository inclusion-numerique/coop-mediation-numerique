export type ActeurIntrouvable = {
  readonly _tag: 'ActeurIntrouvable'
  readonly acteurId: string
}

export const ActeurIntrouvable = (acteurId: string): ActeurIntrouvable => ({
  _tag: 'ActeurIntrouvable',
  acteurId,
})
