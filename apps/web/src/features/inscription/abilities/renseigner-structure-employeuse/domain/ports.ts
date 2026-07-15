import type {
  InscriptionEnCours,
  UserId,
} from '@app/web/features/inscription/domain'
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
 * Lie l'utilisateur à la structure comme employeuse — rompt l'éventuel emploi
 * précédent, crée le nouvel emploi — et projette l'état d'inscription reçu, qui
 * porte déjà l'étape franchie. L'état voyage avec l'emploi car les deux sont
 * posés dans la même transaction.
 */
export type LierEmploi = (input: {
  readonly etat: InscriptionEnCours
  readonly structureId: StructureId
}) => Promise<void>
