import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const ANNEE_NAISSANCE_MIN = 1900
export const ANNEE_NAISSANCE_MAX = new Date().getFullYear()

export const AnneeNaissance = defineModel(
  z
    .number()
    .int()
    .min(ANNEE_NAISSANCE_MIN)
    .max(ANNEE_NAISSANCE_MAX)
    .brand('AnneeNaissance'),
)

export type AnneeNaissance = Model.TypeOf<typeof AnneeNaissance>

const anneeNaissanceInvalide =
  'Veuillez renseigner une année de naissance valide'

/**
 * Validation tolérante (nullish, non brandée) pour parser une année de
 * naissance issue d'une source externe (import de fichier) : renvoie un nombre
 * brut ou l'absence.
 */
export const anneeNaissanceValidation = z
  .number({ invalid_type_error: anneeNaissanceInvalide })
  .int(anneeNaissanceInvalide)
  .min(ANNEE_NAISSANCE_MIN, anneeNaissanceInvalide)
  .max(ANNEE_NAISSANCE_MAX, anneeNaissanceInvalide)
  .nullish()
