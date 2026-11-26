import type {
  InscriptionEnCours,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { LireLEtatDeLInscription } from '@/features/inscription/domain/ports'
import type { SaisieEmployeuse } from './saisie-employeuse'

export type RattacherEmployeuse = (input: {
  readonly userId: UtilisateurId
  readonly saisie: SaisieEmployeuse
}) => Promise<{ readonly success: boolean }>

export type ProjeterEtapeFranchie = (etat: InscriptionEnCours) => Promise<void>

export type RenseignerStructureEmployeusePorts = {
  readonly lireLEtat: LireLEtatDeLInscription
  readonly rattacherEmployeuse: RattacherEmployeuse
  readonly projeterEtapeFranchie: ProjeterEtapeFranchie
}
