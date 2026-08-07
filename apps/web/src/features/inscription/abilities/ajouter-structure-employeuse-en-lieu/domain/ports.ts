import type { UserId } from '@app/web/features/inscription/domain'
import type { EmployeuseId } from './employeuse-id'

/**
 * Rattache l'employeuse comme lieu d'activité : matérialise ses données `main`
 * en `lieu_inclusion` puis crée le `mediateurEnActivite` correspondant.
 *
 * Idempotent, et partagé : deux médiateurs de la même employeuse se rattachent
 * au même lieu — c'est le même établissement physique.
 */
export type LierStructureEmployeuseEnLieu = (input: {
  readonly userId: UserId
  readonly structureEmployeuseId: EmployeuseId
}) => Promise<void>

/**
 * Détache l'employeuse comme lieu d'activité : clôt le `mediateurEnActivite`
 * actif de cet utilisateur sur ce lieu (`fin`/`suppression`).
 *
 * Le lieu lui-même n'est jamais supprimé : d'autres médiateurs peuvent y
 * exercer, et des activités peuvent déjà s'y rattacher.
 */
export type DelierStructureEmployeuseEnLieu = (input: {
  readonly userId: UserId
  readonly structureEmployeuseId: EmployeuseId
}) => Promise<void>
