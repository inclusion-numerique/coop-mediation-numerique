import type { genres } from './genre'
import type { statutsSociaux } from './statut-social'
import type { tranchesAge } from './tranche-age'

export type BeneficiaireEnregistre = {
  readonly id: string
  readonly mediateurId: string
  readonly rdvServicePublicId: number | null
  readonly rdvUserId: number | null
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
  readonly genre: (typeof genres)[number] | null
  readonly trancheAge: (typeof tranchesAge)[number] | null
  readonly statutSocial: (typeof statutsSociaux)[number] | null
  readonly notes: string | null
  readonly creation: Date
  readonly accompagnementsCount: number
}
