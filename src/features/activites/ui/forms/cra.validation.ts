import z from 'zod'
import { CommuneDuCraValidation } from '@/features/activites/ui/forms/commune-du-cra.validation'
import { CraDateValidation } from '@/features/activites/ui/forms/date-du-cra.validation'
import { CraDureeValidation } from '@/features/activites/ui/forms/duree-du-cra.validation'
import { materielValues } from '@/features/activites/ui/labels/libelles/materiel.labels'
import { thematiqueValues } from '@/features/activites/ui/labels/libelles/thematique.labels'
import { typeLieuValues } from '@/features/activites/ui/labels/libelles/type-lieu.labels'

export const CraValidation = z.object({
  id: z.guid().nullish(),
  mediateurId: z.guid(),
  rdvServicePublicId: z.number().nullish(),
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
  lieuCommuneData: CommuneDuCraValidation.nullish(),
  thematiques: z
    .array(z.enum(thematiqueValues), {
      error: 'Veuillez renseigner au moins une thématique',
    })
    .min(1, 'Veuillez renseigner au moins une thématique'),
  tags: z.array(z.object({ id: z.guid() })).default([]),
  precisionsDemarche: z.string().nullish(),
  materiel: z
    .array(z.enum(materielValues))
    .default([])
    .refine(
      (materiel) => !materiel.includes('Aucun') || materiel.length === 1,
      '« Pas de matériel » ne se combine pas avec un matériel',
    ),
  notes: z.string().nullish(),
})

export type CraData = z.infer<typeof CraValidation>
