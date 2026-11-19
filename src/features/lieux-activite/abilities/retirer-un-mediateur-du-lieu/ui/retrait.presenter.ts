export type DernierPassage =
  | { readonly _tag: 'Jamais' }
  | { readonly _tag: 'Le'; readonly date: Date }

export const dateDuDernierPassage = (passage: DernierPassage): Date | null =>
  passage._tag === 'Le' ? passage.date : null
