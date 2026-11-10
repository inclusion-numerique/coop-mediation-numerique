import type { ActiviteDeMediation } from './activite-de-mediation'
import type { GENRES } from './genre'
import type { STATUTS_SOCIAUX } from './statut-social'
import type { TRANCHES_D_AGE } from './tranche-d-age'

export type FicheDuBeneficiaireSuivi = {
  readonly id: string
  readonly prenom: string | null
  readonly nom: string | null
  readonly telephone: string | null
  readonly pasDeTelephone: boolean | null
  readonly email: string | null
  readonly anneeNaissance: number | null
  readonly adresse: string | null
  readonly commune: string | null
  readonly communeCodePostal: string | null
  readonly communeCodeInsee: string | null
  readonly genre: (typeof GENRES)[number] | null
  readonly trancheAge: (typeof TRANCHES_D_AGE)[number] | null
  readonly statutSocial: (typeof STATUTS_SOCIAUX)[number] | null
  readonly notes: string | null
}

export type AffichageDeLActivite = {
  readonly lieu: {
    readonly id: string
    readonly nom: string
    readonly adresse: string | null
  } | null
  readonly suivis: readonly FicheDuBeneficiaireSuivi[]
  readonly tags: readonly { readonly id: string; readonly nom: string }[]
}

export type ActiviteAModifier = {
  readonly activite: ActiviteDeMediation
  readonly affichage: AffichageDeLActivite
}
