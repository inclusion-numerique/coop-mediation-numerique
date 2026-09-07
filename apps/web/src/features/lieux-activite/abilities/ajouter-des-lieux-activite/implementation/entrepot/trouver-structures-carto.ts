import type { TrouverStructuresCarto } from '../../domain'
import { findCartoStructuresByIds } from './structures-carto'

/** Adaptateur du port : la lecture de l'Entrepôt, client Prisma distinct. */
export const trouverStructuresCarto: TrouverStructuresCarto =
  findCartoStructuresByIds
