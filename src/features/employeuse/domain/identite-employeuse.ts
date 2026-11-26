import { z } from 'zod'
import { Siret } from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'
import { AdresseAGeocoder } from './adresse-a-geocoder'
import { DenominationEmployeuse } from './denomination-employeuse'

export const IdentiteEmployeuse = defineModel(
  z
    .object({
      siret: Siret.schema,
      denomination: DenominationEmployeuse.schema
        .nullish()
        .transform((value) => value ?? null),
      adresse: AdresseAGeocoder.schema,
    })
    .brand('IdentiteEmployeuse'),
)

export type IdentiteEmployeuse = Model.TypeOf<typeof IdentiteEmployeuse>
