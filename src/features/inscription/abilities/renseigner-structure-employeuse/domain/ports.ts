import type {
  InscriptionEnCours,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { LireLEtatDeLInscription } from '@/features/inscription/domain/ports'
import type { Result } from '@/libraries/result'

export type RattacherEmployeuse<Employeuse, Rattachement, Echec> = (entree: {
  readonly userId: UtilisateurId
  readonly employeuse: Employeuse
}) => Promise<Result<Rattachement, Echec>>

export type ProjeterEtapeFranchie = (etat: InscriptionEnCours) => Promise<void>

export type RenseignerStructureEmployeusePorts<
  Employeuse,
  Rattachement,
  Echec,
> = {
  readonly lireLEtat: LireLEtatDeLInscription
  readonly rattacherEmployeuse: RattacherEmployeuse<
    Employeuse,
    Rattachement,
    Echec
  >
  readonly projeterEtapeFranchie: ProjeterEtapeFranchie
}
