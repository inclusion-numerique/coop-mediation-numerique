export type Jalon =
  | { readonly _tag: 'Jamais' }
  | { readonly _tag: 'Le'; readonly date: Date }

export const JAMAIS: Jalon = { _tag: 'Jamais' }

export const jalon = (date: Date | null): Jalon =>
  date === null ? JAMAIS : { _tag: 'Le', date }

export const plusRecent = (premier: Jalon, second: Jalon): Jalon => {
  if (premier._tag === 'Jamais') return second
  if (second._tag === 'Jamais') return premier
  return premier.date >= second.date ? premier : second
}
