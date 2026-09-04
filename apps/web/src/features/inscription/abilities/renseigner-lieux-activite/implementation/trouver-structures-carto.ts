import { findCartoStructuresByIds } from '@app/web/features/lieux-activite'
import type { TrouverStructuresCarto } from '../domain'

/**
 * Adaptateur de résolution carto : réutilise la lecture Entrepôt partagée
 * (`findCartoStructuresByIds`) et rend un tableau — la persistance rebâtit sa
 * propre indexation par id.
 */
export const trouverStructuresCarto: TrouverStructuresCarto = async (
  cartoIds,
) => [...(await findCartoStructuresByIds([...cartoIds])).values()]
