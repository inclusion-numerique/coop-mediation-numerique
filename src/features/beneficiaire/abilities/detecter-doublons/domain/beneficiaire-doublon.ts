import { z } from 'zod'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { Email } from '@/features/beneficiaire/domain/email'
import type { Nom } from '@/features/beneficiaire/domain/nom'
import type { Prenom } from '@/features/beneficiaire/domain/prenom'
import { defineModel, type Model } from '@/libraries/model'
import type { Telephone } from '@/libraries/telephone'

export const IdentifiantDeDoublon = defineModel(
  z.string().min(1).brand('IdentifiantDeDoublon'),
)

export type IdentifiantDeDoublon = Model.TypeOf<typeof IdentifiantDeDoublon>

type DoublonEntry = {
  readonly id: BeneficiaireId
  readonly nom: Nom
  readonly prenom: Prenom
  readonly telephone: Telephone | null
  readonly email: Email | null
  readonly creation: Date
}

export type BeneficiaireDoublon = {
  readonly id: IdentifiantDeDoublon
  readonly a: DoublonEntry
  readonly b: DoublonEntry
}
