import type {
  InscriptionEnCours,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { LieuActiviteExistant, LieuActiviteInput } from './reconcilier'

/** Lit les activités en cours de l'utilisateur (pour la réconciliation). */
export type LireLieuxActiviteExistants = (
  userId: UtilisateurId,
) => Promise<readonly LieuActiviteExistant[]>

/**
 * Résout les lieux de la carto (lecture Entrepôt) à créer, indexés par
 * l'identifiant demandé. Injectée
 * pour rester hors du chemin critique et stubbable en test — les deux clients
 * Prisma (coop / entrepôt) ne partageant pas de transaction.
 */
export type TrouverStructuresCarto<StructureCarto> = (
  cartoIds: readonly string[],
) => Promise<ReadonlyMap<string, StructureCarto>>

/**
 * Applique la réconciliation en une transaction : clôt les activités retirées,
 * crée les nouvelles (id interne / structure carto locale existante / création
 * depuis la structure carto), et projette l'état franchi.
 */
export type EnregistrerReconciliation<StructureCarto> = (input: {
  readonly etatFranchi: InscriptionEnCours
  readonly userId: UtilisateurId
  readonly aCloturer: readonly string[]
  readonly aCreer: readonly LieuActiviteInput[]
  readonly structuresCarto: ReadonlyMap<string, StructureCarto>
}) => Promise<void>
