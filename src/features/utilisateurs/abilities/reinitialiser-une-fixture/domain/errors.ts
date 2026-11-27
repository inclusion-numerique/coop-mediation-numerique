import type { UtilisateurIntrouvable } from '@/features/utilisateurs/domain'

export type CompteNonFixture = { readonly _tag: 'CompteNonFixture' }

export const CompteNonFixture = (): CompteNonFixture => ({
  _tag: 'CompteNonFixture',
})

export type EchecDeReinitialiserUneFixture =
  | UtilisateurIntrouvable
  | CompteNonFixture
