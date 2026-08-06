import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Courriel du référent hiérarchique de l'employeuse. Il provient du `contact`
 * jsonb de `main.structure_administrative`, alimenté par les producteurs
 * Dataspace : rien ne garantit qu'il ressemble à une adresse.
 *
 * On le valide donc réellement, et le transfer layer l'ingère via la forme
 * totale (`.safe`) : une valeur qui n'est pas une adresse devient `null` plutôt
 * que d'être affichée, ou pire, recopiée dans un lieu d'activité à
 * l'inscription.
 */
export const CourrielReferent = defineModel(
  z.string().trim().toLowerCase().email().brand('CourrielReferent'),
)

export type CourrielReferent = Model.TypeOf<typeof CourrielReferent>
