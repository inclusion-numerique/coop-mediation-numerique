import type {
  InscriptionEnCours,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { LireLEtatDeLInscription } from '@/features/inscription/domain/ports'
import type { LieuActiviteExistant, LieuActiviteInput } from './reconcilier'

export type LireLieuxActiviteExistants = (
  userId: UtilisateurId,
) => Promise<readonly LieuActiviteExistant[]>

export type TrouverStructuresCarto<StructureCarto> = (
  cartoIds: readonly string[],
) => Promise<ReadonlyMap<string, StructureCarto>>

export type EnregistrerReconciliation<StructureCarto> = (input: {
  readonly etatFranchi: InscriptionEnCours
  readonly userId: UtilisateurId
  readonly aCloturer: readonly string[]
  readonly aCreer: readonly LieuActiviteInput[]
  readonly structuresCarto: ReadonlyMap<string, StructureCarto>
  readonly maintenant: Date
}) => Promise<void>

export type RenseignerLieuxActivitePorts<StructureCarto> = {
  readonly lireLEtat: LireLEtatDeLInscription
  readonly lireLieuxActiviteExistants: LireLieuxActiviteExistants
  readonly trouverStructuresCarto: TrouverStructuresCarto<StructureCarto>
  readonly enregistrerReconciliation: EnregistrerReconciliation<StructureCarto>
}
