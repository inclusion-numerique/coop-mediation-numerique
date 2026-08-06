import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * SIRET d'une employeuse, tel qu'il est lu dans `main` : 14 chiffres.
 *
 * On ne rejoue volontairement PAS ici la validation de saisie (clé de Luhn,
 * dérogation La Poste) qui vit à la frontière d'import : appliquée en lecture,
 * elle ferait disparaître de l'affichage des SIRET que SIRENE nous donne pour
 * authentiques. Le transfer layer utilise la forme totale (`.safe`) : une
 * valeur illisible en base devient `null` au lieu de faire échouer la lecture
 * entière de l'employeuse.
 */
export const Siret = defineModel(
  z
    .string()
    .trim()
    .regex(/^\d{14}$/)
    .brand('Siret'),
)

export type Siret = Model.TypeOf<typeof Siret>
