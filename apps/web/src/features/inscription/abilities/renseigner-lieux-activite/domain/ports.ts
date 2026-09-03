import type {
  InscriptionEnCours,
  UserId,
} from '@app/web/features/inscription/domain'
// Type partagé de la structure carto de l'Entrepôt (erasé au build) — même
// forme que celle consommée par le module partagé `structure/`.
import type { CartoStructure } from '@app/web/features/lieux-activite'
import type { CreerLieuActiviteData } from '@app/web/features/structures/CreerLieuActiviteValidation'
import type { MediateurId } from './mediateur-id'
import type { LieuActiviteExistant, LieuActiviteInput } from './reconcilier'

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
  readonly aCloturer: readonly string[]
  readonly aCreer: readonly LieuActiviteInput[]
  readonly structuresCarto: readonly CartoStructure[]
}) => Promise<void>

/**
 * Crée le lieu saisi et y rattache le médiateur — ou le rattache au lieu que la
 * coop connaissait déjà sous une autre dénomination. Rend le lieu rattaché.
 */
export type CreerLieuActivite = (input: {
  readonly userId: UserId
  readonly mediateurId: MediateurId
  readonly saisie: CreerLieuActiviteData
}) => Promise<{ readonly id: string }>

/**
 * Résout le profil médiateur de l'utilisateur. Un lieu d'activité ne se
 * rattache qu'à soi-même : le médiateur se dérive de l'acteur authentifié au
 * lieu d'être fourni par l'appelant, sans quoi l'invariant ne tiendrait qu'à la
 * discipline de ce dernier.
 */
export type MediateurFromUser = (userId: UserId) => Promise<MediateurId | null>
