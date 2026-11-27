import type { UtilisateurIntrouvable } from '@/features/utilisateurs/domain'

export type UsurpationHorsFixtures = { readonly _tag: 'UsurpationHorsFixtures' }

export const UsurpationHorsFixtures = (): UsurpationHorsFixtures => ({
  _tag: 'UsurpationHorsFixtures',
})

export type EchecDUsurperUnUtilisateur =
  | UtilisateurIntrouvable
  | UsurpationHorsFixtures
