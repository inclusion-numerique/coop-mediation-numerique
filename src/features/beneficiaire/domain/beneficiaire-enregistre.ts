import type { Telephone } from '@/libraries/telephone'
import type { AnneeNaissance } from './annee-naissance'
import type { BeneficiaireId } from './beneficiaire-id'
import type { Email } from './email'
import type { genres } from './genre'
import type { MediateurId } from './mediateur-id'
import type { Nom } from './nom'
import type { Notes } from './notes'
import type { Prenom } from './prenom'
import type { statutsSociaux } from './statut-social'
import type { tranchesAge } from './tranche-age'

export type BeneficiaireEnregistre = {
  readonly id: BeneficiaireId
  readonly mediateurId: MediateurId
  readonly rdvServicePublicId: number | null
  readonly rdvUserId: number | null
  readonly prenom: Prenom | null
  readonly nom: Nom | null
  readonly telephone: Telephone | null
  readonly pasDeTelephone: boolean | null
  readonly email: Email | null
  readonly anneeNaissance: AnneeNaissance | null
  readonly adresse: string | null
  readonly commune: string | null
  readonly communeCodePostal: string | null
  readonly communeCodeInsee: string | null
  readonly genre: (typeof genres)[number] | null
  readonly trancheAge: (typeof tranchesAge)[number] | null
  readonly statutSocial: (typeof statutsSociaux)[number] | null
  readonly notes: Notes | null
  readonly creation: Date
  readonly accompagnementsCount: number
}
