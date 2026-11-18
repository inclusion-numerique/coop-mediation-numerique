export type ActiviteIntrouvable = { readonly _tag: 'ActiviteIntrouvable' }

export const ActiviteIntrouvable = (): ActiviteIntrouvable => ({
  _tag: 'ActiviteIntrouvable',
})

export type ActionNonAutorisee = { readonly _tag: 'ActionNonAutorisee' }

export const ActionNonAutorisee = (): ActionNonAutorisee => ({
  _tag: 'ActionNonAutorisee',
})

export type EchecDeSuppression = ActiviteIntrouvable | ActionNonAutorisee
