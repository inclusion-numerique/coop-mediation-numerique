import type {
  Schedule,
  Time,
} from '@gouvfr-anct/timetable-to-osm-opening-hours'
import { z } from 'zod'

const FORMAT_HEURE = /^([01]\d|2[0-3]):([0-5]\d)$/

/**
 * Une heure au format du standard : `Time` est un type littéral `HH:MM`, que
 * `z.string()` ne sait pas produire. Le prédicat le garantit à l'exécution, ce
 * qui évite le `as` que demanderait sinon la conversion vers `Schedule`.
 *
 * La chaîne vide est la façon dont le formulaire vide un horaire quand la
 * demi-journée se ferme : elle devient une absence, pas une erreur de saisie.
 */
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

/**
 * Une demi-journée ouverte porte ses deux heures. Sans elles, la composition
 * OSM laisserait tomber l'ouverture : la grille afficherait un créneau que la
 * fiche n'annoncerait pas.
 */
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
        code: z.ZodIssueCode.custom,
        message: 'À renseigner',
        path: ['startTime'],
      })

    if (endTime == null)
      contexte.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'À renseigner',
        path: ['endTime'],
      })
  })

const Journee = z.object({ am: DemiJournee, pm: DemiJournee })

/**
 * La grille hebdomadaire, validée dans la forme qu'attend le standard.
 *
 * Elle vit au niveau de la feature parce que créer un lieu et corriger sa fiche
 * saisissent les mêmes horaires : deux grilles ont longtemps coexisté, l'une
 * exigeant les heures d'une demi-journée ouverte, l'autre le format `HH:MM`.
 * Celle-ci demande les deux.
 */
export const HorairesValidation = z.object({
  Mo: Journee,
  Tu: Journee,
  We: Journee,
  Th: Journee,
  Fr: Journee,
  Sa: Journee,
  Su: Journee,
}) satisfies z.ZodType<Schedule, z.ZodTypeDef, unknown>

export type HorairesSaisis = z.input<typeof HorairesValidation>
