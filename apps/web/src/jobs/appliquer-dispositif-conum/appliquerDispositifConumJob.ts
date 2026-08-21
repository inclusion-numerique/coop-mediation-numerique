import z from 'zod'

export const AppliquerDispositifConumJobValidation = z.object({
  name: z.literal('appliquer-dispositif-conum'),
  payload: z
    .object({
      /**
       * Fenêtre de rattrapage, en heures. Le job ne regarde que les affectations emploi modifiées
       * depuis — l'Entrepôt les horodate par trigger. 25 h par défaut : une heure de recouvrement
       * avec la cadence quotidienne, pour qu'un passage en retard ne laisse pas de trou.
       */
      depuisHeures: z.number().positive().optional().default(25),
      /**
       * Garde-fou de volume. Si l'Entrepôt rejoue un chargement complet, `updated_at` bouge pour
       * tout le monde d'un coup : sans borne, ce serait une salve de milliers de contacts Brevo.
       * Au-delà, le job garantit quand même les coordinateurs (idempotent, sans effet externe) mais
       * s'abstient de notifier, et le dit.
       */
      limiteBrevo: z.number().int().positive().optional().default(500),
      /** Passe outre la borne ci-dessus, en connaissance de cause. */
      forcerBrevo: z.boolean().optional().default(false),
    })
    .optional(),
})

export type AppliquerDispositifConumJob = z.infer<
  typeof AppliquerDispositifConumJobValidation
>
