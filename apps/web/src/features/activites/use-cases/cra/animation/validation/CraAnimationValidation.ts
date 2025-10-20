import z from 'zod'
import { CraDureeValidation } from '../../validation/CraDureeValidation'

const initiativeValues = ['Initiative', 'Demande'] as const

export type InitiativeValue = (typeof initiativeValues)[number]

const typeAnimationValues = [
  'Assemblee',
  'Comite',
  'GroupeDeTravail',
  'Echange',
  'ReunionCoordination',
  'Webinaire',
  'Autre',
] as const

export type TypeAnimationValue = (typeof typeAnimationValues)[number]

const thematiqueAnimationValues = [
  'Partage',
  'Reseau',
  'Soutien',
  'Professionnel',
  'RH',
  'Autre',
] as const

export type ThematiqueAnimationValue =
  (typeof thematiqueAnimationValues)[number]

export const CraAnimationValidation = z
  .object({
    id: z.string().uuid().nullish(), // defined if update, nullish if create
    date: z
      .string({ required_error: 'Veuillez renseigner une date' })
      .date('Veuillez renseigner une date valide'),
    duree: CraDureeValidation,
    coordinateurId: z.string().uuid(), // owner of the CRA
    mediateurs: z.number().nullish(),
    structures: z.number().nullish(),
    autresActeurs: z.number().nullish(),
    typeAnimation: z.enum(typeAnimationValues, {
      required_error: 'Veuillez renseigner un type d’animation',
    }),
    typeAnimationAutre: z.string().nullish(),
    initiative: z.enum(initiativeValues).nullish(),
    thematiquesAnimation: z.array(z.enum(thematiqueAnimationValues), {
      required_error: 'Veuillez renseigner au moins une thématique d’animation',
    }),
    thematiqueAnimationAutre: z.string().nullish(),
    tags: z.array(z.object({ id: z.string().uuid() })).default([]),
    notes: z.string().nullish(),
  })
  .superRefine((data, ctx) => {
    const hasMediateurs = (data.mediateurs ?? 0) > 0
    const hasStructures = (data.structures ?? 0) > 0
    const hasAutresActeurs = (data.autresActeurs ?? 0) > 0

    if (!hasMediateurs && !hasStructures && !hasAutresActeurs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mediateurs'],
        message:
          'Veuillez renseigner au moins un médiateur, une structure ou un autre acteur',
      })
    }

    if (data.typeAnimation === 'Autre' && !data.typeAnimationAutre?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['typeAnimationAutre'],
        message: 'Veuillez préciser le type d’animation',
      })
    }

    if (
      data.thematiquesAnimation.includes('Autre') &&
      !data.thematiqueAnimationAutre?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['thematiqueAnimationAutre'],
        message: 'Veuillez préciser la thématique d’animation',
      })
    }
  })

export type CraAnimationData = z.infer<typeof CraAnimationValidation>
