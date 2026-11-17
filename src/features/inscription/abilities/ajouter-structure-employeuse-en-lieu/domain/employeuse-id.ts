import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Identifiant de l'employeuse : l'entier `main.structure_administrative.id`.
 * Référence cross-feature, brandée localement (AR-3).
 *
 * Ce n'est volontairement pas un uuid coop. Depuis l'échange final de l'ADR-002
 * l'employeuse est une ligne `main`, et c'est cet identifiant que l'écran
 * d'inscription reçoit — les deux espaces ne désignent pas la même ligne.
 */
export const EmployeuseId = defineModel(
  z.number().int().positive().brand('EmployeuseId'),
)

export type EmployeuseId = Model.TypeOf<typeof EmployeuseId>
