import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import z from 'zod'
import { materielValues } from '../fields/materiel'
import { thematiqueValues } from '../fields/thematique'
import { typeLieuValues } from '../fields/type-lieu'
import { CraDateValidation } from './CraDateValidation'
import { CraDureeValidation } from './CraDureeValidation'

export const CraValidation = z.object({
  id: z.guid().nullish(), // defined if update, nullish if create
  mediateurId: z.guid(), // owner of the CRA
  rdvServicePublicId: z.number().nullish(), // id externe du RDV Service Public qui est à l'origine de cette Activité
  date: CraDateValidation,
  duree: CraDureeValidation,
  typeLieu: z.enum(typeLieuValues, {
    error: 'Veuillez renseigner un lieu d’accompagnement',
  }),
  structure: z
    .object({
      id: z.guid(),
      nom: z.string(),
      adresse: z.string(),
    })
    .nullish(),
  lieuCommuneData: AdresseBanValidation.nullish(),
  thematiques: z
    .array(z.enum(thematiqueValues), {
      error: 'Veuillez renseigner au moins une thématique',
    })
    .min(1, 'Veuillez renseigner au moins une thématique'),
  tags: z.array(z.object({ id: z.guid() })).default([]),
  precisionsDemarche: z.string().nullish(),
  materiel: z.array(z.enum(materielValues)).default([]),
  notes: z.string().nullish(),
})

export type CraData = z.infer<typeof CraValidation>
