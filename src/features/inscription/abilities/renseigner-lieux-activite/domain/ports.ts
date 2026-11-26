import type {
  InscriptionEnCours,
  LieuId,
  LieuIntrouvable,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { LireLEtatDeLInscription } from '@/features/inscription/domain/ports'
import type { Result } from '@/libraries/result'
import type { LieuActiviteExistant, LieuActiviteInput } from './reconcilier'

export type LireLieuxActiviteExistants = (
  userId: UtilisateurId,
) => Promise<readonly LieuActiviteExistant[]>

export type TrouverStructuresCarto<StructureCarto> = (
  cartoIds: readonly string[],
) => Promise<ReadonlyMap<string, StructureCarto>>

export type PlanifierLesRattachements<StructureCarto, Destination> = (input: {
  readonly lieux: readonly LieuActiviteInput[]
  readonly structuresCarto: ReadonlyMap<string, StructureCarto>
  readonly maintenant: Date
}) => Promise<Result<readonly Destination[], LieuIntrouvable>>

export type ReconciliationEnregistree =
  | { readonly _tag: 'Enregistree' }
  | { readonly _tag: 'LieuDisparu'; readonly lieuId: LieuId }

export type EnregistrerReconciliation<Destination> = (input: {
  readonly etatFranchi: InscriptionEnCours
  readonly userId: UtilisateurId
  readonly aCloturer: readonly string[]
  readonly destinations: readonly Destination[]
  readonly maintenant: Date
}) => Promise<ReconciliationEnregistree>

export type RenseignerLieuxActivitePorts<StructureCarto, Destination> = {
  readonly lireLEtat: LireLEtatDeLInscription
  readonly lireLieuxActiviteExistants: LireLieuxActiviteExistants
  readonly trouverStructuresCarto: TrouverStructuresCarto<StructureCarto>
  readonly planifierLesRattachements: PlanifierLesRattachements<
    StructureCarto,
    Destination
  >
  readonly enregistrerReconciliation: EnregistrerReconciliation<Destination>
}
