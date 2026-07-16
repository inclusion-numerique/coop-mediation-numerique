import type {
  InscriptionEnCours,
  UserId,
} from '@app/web/features/inscription/domain'
// Type partagé de la structure carto de l'Entrepôt (erasé au build) — même
// forme que celle consommée par le module partagé `structure/`.
import type { CartoStructure } from '@app/web/features/lieux-activite/use-cases/ajouter/domain'
import type { LieuActiviteDesire, LieuActiviteExistant } from './reconcilier'

/** Lit les activités en cours de l'utilisateur (pour la réconciliation). */
export type LireLieuxActiviteExistants = (
  userId: UserId,
) => Promise<readonly LieuActiviteExistant[]>

/**
 * Résout les structures carto (lecture Entrepôt) des lieux à créer. Injectée
 * pour rester hors du chemin critique et stubbable en test — les deux clients
 * Prisma (coop / entrepôt) ne partageant pas de transaction.
 */
export type TrouverStructuresCarto = (
  cartoIds: readonly string[],
) => Promise<readonly CartoStructure[]>

/**
 * Applique la réconciliation en une transaction : clôt les activités retirées,
 * crée les nouvelles (id interne / structure carto locale existante / création
 * depuis la structure carto), et projette l'état franchi.
 */
export type EnregistrerReconciliation = (input: {
  readonly etatFranchi: InscriptionEnCours
  readonly userId: UserId
  readonly aClaturer: readonly string[]
  readonly aCreer: readonly LieuActiviteDesire[]
  readonly structuresCarto: readonly CartoStructure[]
}) => Promise<void>
