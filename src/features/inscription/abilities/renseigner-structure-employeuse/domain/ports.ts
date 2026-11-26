import type {
  InscriptionEnCours,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { LireLEtatDeLInscription } from '@/features/inscription/domain/ports'
import type { Result } from '@/libraries/result'

export type RattacherEmployeuse<Employeuse, Rattachement> = (entree: {
  readonly userId: UtilisateurId
  readonly employeuse: Employeuse
}) => Promise<Result<Rattachement, unknown>>

export type ProjeterEtapeFranchie = (etat: InscriptionEnCours) => Promise<void>

export type RenseignerStructureEmployeusePorts<Employeuse, Rattachement> = {
  readonly lireLEtat: LireLEtatDeLInscription
  readonly rattacherEmployeuse: RattacherEmployeuse<Employeuse, Rattachement>
  readonly projeterEtapeFranchie: ProjeterEtapeFranchie
}
