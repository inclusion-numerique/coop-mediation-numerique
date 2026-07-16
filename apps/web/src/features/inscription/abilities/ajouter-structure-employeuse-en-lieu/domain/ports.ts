import type { UserId } from '@app/web/features/inscription/domain'
import type { StructureId } from './structure-id'

/**
 * Rattache la structure employeuse comme lieu d'activité : matérialise
 * l'employeuse (`structure_administrative`) en `lieu_inclusion` puis crée le
 * `mediateurEnActivite` correspondant. Idempotent : un lieu déjà rattaché n'est
 * pas dupliqué.
 */
export type LierStructureEmployeuseEnLieu = (input: {
  readonly userId: UserId
  readonly structureEmployeuseId: StructureId
}) => Promise<void>

/**
 * Détache la structure employeuse comme lieu d'activité : clôt le
 * `mediateurEnActivite` actif rattaché à cette structure (`fin`/`suppression`).
 */
export type DelierStructureEmployeuseEnLieu = (input: {
  readonly userId: UserId
  readonly structureEmployeuseId: StructureId
}) => Promise<void>
