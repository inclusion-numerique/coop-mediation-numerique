export const estActeurDeLaCoop = (compte: {
  readonly role: string
  readonly inscriptionValidee: string | null
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: { readonly id: string } | null
}): boolean =>
  compte.role === 'Admin' ||
  (compte.inscriptionValidee !== null &&
    (compte.mediateur !== null || compte.coordinateur !== null))
