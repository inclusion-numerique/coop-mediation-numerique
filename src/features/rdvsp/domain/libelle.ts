import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const libelle = (brand: string) => z.string().trim().min(1).brand(brand)

export const NomOrganisation = defineModel(libelle('NomOrganisation'))
export type NomOrganisation = Model.TypeOf<typeof NomOrganisation>

export const NomMotif = defineModel(libelle('NomMotif'))
export type NomMotif = Model.TypeOf<typeof NomMotif>

export const NomAtelier = defineModel(libelle('NomAtelier'))
export type NomAtelier = Model.TypeOf<typeof NomAtelier>
