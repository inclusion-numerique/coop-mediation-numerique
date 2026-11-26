export type CompteNonFixture = { readonly _tag: 'CompteNonFixture' }

export const CompteNonFixture = (): CompteNonFixture => ({
  _tag: 'CompteNonFixture',
})

export type EchecDeReinitialiserUneFixture = CompteNonFixture
