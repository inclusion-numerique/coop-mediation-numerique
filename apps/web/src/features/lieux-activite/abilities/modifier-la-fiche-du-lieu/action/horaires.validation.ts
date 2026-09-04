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

const DemiJournee = z.object({
  startTime: Heure,
  endTime: Heure,
  isOpen: z.boolean(),
})

const Journee = z.object({ am: DemiJournee, pm: DemiJournee })

/**
 * La grille hebdomadaire, validée dans la forme qu'attend le standard — d'où
 * le fait qu'elle vive ici et non dans le formulaire de création : le contrat
 * d'entrée d'une ability ne dépend pas du schéma d'un formulaire.
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
