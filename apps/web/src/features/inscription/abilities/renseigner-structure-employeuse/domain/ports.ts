import type { UserId } from '@app/web/features/inscription/domain'
import type { StructureEmployeuseInput } from './structure-employeuse-input'
import type { StructureId } from './structure-id'

/**
 * Crée ou retrouve la structure employeuse et renvoie son identifiant.
 * → implémenté par la feature structure (ACL).
 */
export type EnsureStructureEmployeuse = (input: {
  readonly userId: UserId
  readonly structureEmployeuse: StructureEmployeuseInput
}) => Promise<StructureId>

/**
 * Lie l'utilisateur à la structure comme employeuse : rompt l'éventuel emploi
 * précédent, crée le nouvel emploi et marque l'étape franchie.
 */
export type LierEmploi = (input: {
  readonly userId: UserId
  readonly structureId: StructureId
}) => Promise<void>
