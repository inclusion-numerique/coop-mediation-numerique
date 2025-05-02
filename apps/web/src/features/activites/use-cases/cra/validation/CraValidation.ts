import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import z from 'zod'
import { materielValues } from '../fields/materiel'
import { thematiqueValues } from '../fields/thematique'
import { typeLieuValues } from '../fields/type-lieu'
import { CraDureeValidation } from './CraDureeValidation'

export const CraValidation = z.object({
  id: z.string().uuid().nullish(), // defined if update, nullish if create
  mediateurId: z.string().uuid(), // owner of the CRA
  date: z
    .string({ required_error: 'Veuillez renseigner une date' })
    .date('Veuillez renseigner une date valide'),
  duree: CraDureeValidation,
  typeLieu: z.enum(typeLieuValues, {
    required_error: 'Veuillez renseigner un lieu d’accompagnement',
  }),
  structureId: z.string().uuid().nullish(),
  lieuCommuneData: AdresseBanValidation.nullish(),
  thematiques: z
    .array(z.enum(thematiqueValues), {
      required_error: 'Veuillez renseigner au moins une thématique',
    })
    .min(1, 'Veuillez renseigner au moins une thématique'),
  precisionsDemarche: z.string().nullish(),
  materiel: z.array(z.enum(materielValues)).default([]),
  notes: z.string().nullish(),
})

export type CraData = z.infer<typeof CraValidation>
