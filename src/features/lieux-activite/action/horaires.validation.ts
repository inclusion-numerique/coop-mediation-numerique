import type {
  Schedule,
  Time,
} from '@gouvfr-anct/timetable-to-osm-opening-hours'
import { z } from 'zod'

const FORMAT_HEURE = /^([01]\d|2[0-3]):([0-5]\d)$/

const Heure = z
  .union([
    z.literal(''),
    z.custom<Time>(
      (valeur) => typeof valeur === 'string' && FORMAT_HEURE.test(valeur),
      { message: 'Veuillez renseigner une heure au format HH:MM' },
    ),
  ])
  .nullish()
  .transform((valeur) => (valeur == null || valeur === '' ? null : valeur))

const DemiJournee = z
  .object({
    startTime: Heure,
    endTime: Heure,
    isOpen: z.boolean(),
  })
  .superRefine(({ isOpen, startTime, endTime }, contexte) => {
    if (!isOpen) return

    if (startTime == null)
      contexte.addIssue({
        code: 'custom',
        message: 'À renseigner',
        path: ['startTime'],
      })

    if (endTime == null)
      contexte.addIssue({
        code: 'custom',
        message: 'À renseigner',
        path: ['endTime'],
      })
  })

const Journee = z.object({ am: DemiJournee, pm: DemiJournee })

export const HorairesValidation = z.object({
  Mo: Journee,
  Tu: Journee,
  We: Journee,
  Th: Journee,
  Fr: Journee,
  Sa: Journee,
  Su: Journee,
}) satisfies z.ZodType<Schedule, unknown>

export type HorairesSaisis = z.input<typeof HorairesValidation>
