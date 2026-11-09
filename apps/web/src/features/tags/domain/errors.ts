export type TagIntrouvable = { readonly _tag: 'TagIntrouvable' }

export const TagIntrouvable = (): TagIntrouvable => ({ _tag: 'TagIntrouvable' })

export type ActionNonAutorisee = { readonly _tag: 'ActionNonAutorisee' }

export const ActionNonAutorisee = (): ActionNonAutorisee => ({
  _tag: 'ActionNonAutorisee',
})

export type VisibiliteNonAutorisee = { readonly _tag: 'VisibiliteNonAutorisee' }

export const VisibiliteNonAutorisee = (): VisibiliteNonAutorisee => ({
  _tag: 'VisibiliteNonAutorisee',
})

export type DestinationNonAutorisee = {
  readonly _tag: 'DestinationNonAutorisee'
}

export const DestinationNonAutorisee = (): DestinationNonAutorisee => ({
  _tag: 'DestinationNonAutorisee',
})
