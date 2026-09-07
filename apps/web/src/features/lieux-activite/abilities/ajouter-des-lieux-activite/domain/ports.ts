import type { MediateurId } from '../../../domain/mediateur-id'
import type { LieuCarto } from './lieu-carto'
import type { LieuDejaRattache } from './lieu-demande'

/**
 * Résout les lieux de la cartographie nationale à matérialiser, indexés par
 * l'identifiant demandé.
 *
 * Injectée plutôt qu'appelée directement : elle lit l'Entrepôt, dont le client
 * Prisma ne partage pas de transaction avec celui de la coop. La résolution a
 * donc lieu AVANT d'ouvrir la transaction d'écriture, et un test peut la
 * remplacer sans base distante.
 */
export type TrouverStructuresCarto = (
  cartoIds: readonly string[],
) => Promise<ReadonlyMap<string, LieuCarto>>

/** Lit les lieux auxquels le médiateur exerce déjà. */
export type LireLieuxDejaRattaches = (
  mediateurId: MediateurId,
) => Promise<readonly LieuDejaRattache[]>

export type AjouterDesLieuxActivitePorts = {
  readonly trouverStructuresCarto: TrouverStructuresCarto
  readonly lireLieuxDejaRattaches: LireLieuxDejaRattaches
}
