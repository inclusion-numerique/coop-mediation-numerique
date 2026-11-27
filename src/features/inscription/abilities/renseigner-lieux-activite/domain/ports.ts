import type {
  InscriptionEnCours,
  LieuId,
  LieuIntrouvable,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { LireLEtatDeLInscription } from '@/features/inscription/domain/ports'
import type { Result } from '@/libraries/result'
import type { IdentifiantCartographie } from './identifiant-cartographie'
import type { LieuDesire } from './lieu-soumis'
import type { RattachementId } from './rattachement-id'
import type { LieuActiviteExistant } from './reconcilier'

type LireLieuxActiviteExistants = (
  userId: UtilisateurId,
) => Promise<readonly LieuActiviteExistant[]>

type TrouverStructuresCarto<StructuresCarto> = (
  cartoIds: readonly IdentifiantCartographie[],
) => Promise<StructuresCarto>

type PlanifierLesRattachements<Adresse, StructuresCarto, Destination> =
  (input: {
    readonly lieux: readonly LieuDesire<Adresse>[]
    readonly structuresCarto: StructuresCarto
    readonly maintenant: Date
  }) => Promise<Result<readonly Destination[], LieuIntrouvable>>

export type ReconciliationEnregistree =
  | { readonly _tag: 'Enregistree' }
  | { readonly _tag: 'LieuDisparu'; readonly lieuId: LieuId }

export type EnregistrerReconciliation<Destination> = (input: {
  readonly etatFranchi: InscriptionEnCours
  readonly userId: UtilisateurId
  readonly aCloturer: readonly RattachementId[]
  readonly destinations: readonly Destination[]
  readonly maintenant: Date
}) => Promise<ReconciliationEnregistree>

export type RenseignerLieuxActivitePorts<
  Adresse,
  StructuresCarto,
  Destination,
> = {
  readonly lireLEtat: LireLEtatDeLInscription
  readonly lireLieuxActiviteExistants: LireLieuxActiviteExistants
  readonly trouverStructuresCarto: TrouverStructuresCarto<StructuresCarto>
  readonly planifierLesRattachements: PlanifierLesRattachements<
    Adresse,
    StructuresCarto,
    Destination
  >
  readonly enregistrerReconciliation: EnregistrerReconciliation<Destination>
}
