import { dureeAccompagnementPersonnaliseeValue } from '@app/web/features/activites/ui/libelles/duree-accompagnement'
import { z } from 'zod'

export const maxMinutes = 59
export const maxHeures = 23

export const CraDureeValidation = z
  .object({
    duree: z.string({
      error: 'Veuillez renseigner une durée',
    }),
    dureePersonnaliseeHeures: z
      .number({ message: `De 0 à ${maxHeures} heures` })
      .max(maxHeures, {
        message: `De 0 à ${maxHeures} heures`,
      })
      .nullish(),
    dureePersonnaliseeMinutes: z
      .number({ message: `De 0 à ${maxMinutes} minutes` })
      .max(maxMinutes, {
        message: `De 0 à ${maxMinutes} minutes`,
      })
      .nullish(),
  })
  .refine(
    (data) =>
      data.duree !== dureeAccompagnementPersonnaliseeValue ||
      !!data.dureePersonnaliseeMinutes ||
      !!data.dureePersonnaliseeHeures,
    {
      message: 'Veuillez renseigner une durée personnalisée',
      path: ['duree'],
    },
  )

export type CraDureeData = z.infer<typeof CraDureeValidation>
