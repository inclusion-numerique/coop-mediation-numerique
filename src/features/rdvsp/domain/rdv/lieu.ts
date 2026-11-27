import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { OrganisationId } from '../identifiants/organisation-id'
import type { TelephoneExterne } from '../identite'
import type { AdresseRdv } from './adresse-rdv'

export const LieuId = defineModel(z.number().int().positive().brand('LieuId'))
export type LieuId = Model.TypeOf<typeof LieuId>

export const NomLieu = defineModel(z.string().trim().min(1).brand('NomLieu'))
export type NomLieu = Model.TypeOf<typeof NomLieu>

export type Lieu = {
  readonly id: LieuId
  readonly nom: NomLieu
  readonly adresse: AdresseRdv | null
  readonly organisationId: OrganisationId
  readonly telephone: TelephoneExterne | null
  readonly usageUnique: boolean
}
