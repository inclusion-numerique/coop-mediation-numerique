import { findCartoStructuresByIds } from '@app/web/features/lieux-activite'
import type { TrouverStructuresCarto } from '../domain'

/**
 * Adaptateur du port : la lecture Entrepôt partagée, telle quelle. Elle indexe
 * déjà par l'identifiant demandé, la clé dont la matérialisation a besoin.
 */
export const trouverStructuresCarto: TrouverStructuresCarto =
  findCartoStructuresByIds
