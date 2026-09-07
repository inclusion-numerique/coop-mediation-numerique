import { defineModel, type Model } from '@app/web/libraries/model'
import { telephoneCanonique } from '@app/web/libraries/telephone'
import { z } from 'zod'

/**
 * Forme canonique : international compact E.164 (`+33XXXXXXXXX`, `+262…`, mais
 * aussi `+32…`, `+44…`, `+237…` — tout indicatif pays valide). Accepte le
 * national français/DOM, l'international (`+`, `00`, `(+…)`) et les séparateurs,
 * délègue le parsing et la validation par pays à `telephoneCanonique`, et sort
 * toujours normalisé. Reste strict : un numéro non valide pour son pays (ex.
 * indicatif de zone nord-américain inexistant) est rejeté.
 */
export const Telephone = defineModel(
  z
    .string()
    .transform((raw, ctx) => {
      const canonique = telephoneCanonique(raw)
      if (canonique == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid' })
        return z.NEVER
      }
      return canonique
    })
    .brand('Telephone'),
)

export type Telephone = Model.TypeOf<typeof Telephone>

// La mise en forme d'affichage vit dans `libraries/telephone` : elle ne dépend
// d'aucun domaine, et l'employeuse l'utilise aussi pour son contact référent.
