import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Identifiant d'une employeuse dans `main.structure_administrative` (entier
 * auto-incrémenté, possédé par l'Entrepôt). La coop ne le fabrique jamais, elle
 * le lit : un id non entier positif est une incohérence de base, pas une donnée
 * métier absente — d'où un constructeur strict.
 */
export const EmployeuseId = defineModel(
  z.number().int().positive().brand('EmployeuseId'),
)

export type EmployeuseId = Model.TypeOf<typeof EmployeuseId>
