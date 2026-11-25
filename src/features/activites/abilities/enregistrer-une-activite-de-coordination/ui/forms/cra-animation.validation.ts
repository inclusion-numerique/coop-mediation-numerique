import z from 'zod'
import { CraDateValidation } from '@/features/activites/ui/forms/date-du-cra.validation'
import { CraDureeValidation } from '@/features/activites/ui/forms/duree-du-cra.validation'

const initiativeValues = ['Initiative', 'Demande'] as const

const typeAnimationValues = [
  'Assemblee',
  'Comite',
  'GroupeDeTravail',
  'Echange',
  'ReunionCoordination',
  'Webinaire',
  'Autre',
] as const

const thematiqueAnimationValues = [
  'Partage',
  'Reseau',
  'Soutien',
  'Professionnel',
  'RH',
  'Autre',
] as const

export const CraAnimationValidation = z
  .object({
    id: z.guid().nullish(),
    date: CraDateValidation,
    duree: CraDureeValidation,
    coordinateurId: z.guid(),
    mediateurs: z.number().nullish(),
    structures: z.number().nullish(),
    autresActeurs: z.number().nullish(),
    typeAnimation: z.enum(typeAnimationValues, {
      error: 'Veuillez renseigner un type d’animation',
    }),
    typeAnimationAutre: z.string().nullish(),
    initiative: z.enum(initiativeValues).nullish(),
    thematiquesAnimation: z.array(z.enum(thematiqueAnimationValues), {
      error: 'Veuillez renseigner au moins une thématique d’animation',
    }),
    thematiqueAnimationAutre: z.string().nullish(),
    tags: z.array(z.object({ id: z.guid() })).default([]),
    notes: z.string().nullish(),
  })
  .superRefine((data, ctx) => {
    const hasMediateurs = (data.mediateurs ?? 0) > 0
    const hasStructures = (data.structures ?? 0) > 0
    const hasAutresActeurs = (data.autresActeurs ?? 0) > 0

    if (!hasMediateurs && !hasStructures && !hasAutresActeurs) {
      ctx.addIssue({
        code: 'custom',
        path: ['mediateurs'],
        message:
          'Veuillez renseigner au moins un médiateur, une structure ou un autre acteur',
      })
    }

    if (data.typeAnimation === 'Autre' && !data.typeAnimationAutre?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['typeAnimationAutre'],
        message: 'Veuillez préciser le type d’animation',
      })
    }

    if (
      data.thematiquesAnimation.includes('Autre') &&
      !data.thematiqueAnimationAutre?.trim()
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['thematiqueAnimationAutre'],
        message: 'Veuillez préciser la thématique d’animation',
      })
    }
  })

export type CraAnimationData = z.infer<typeof CraAnimationValidation>
