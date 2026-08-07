import type {
  InscriptionEnCours,
  UserId,
} from '@app/web/features/inscription/domain'
import type { StructureEmployeuseInput } from './structure-employeuse-input'

/**
 * Rattache l'utilisateur à l'employeuse choisie — création ou réutilisation de
 * la structure, rupture du rattachement précédent, pose du nouveau — et dit si
 * l'opération a abouti.
 *
 * → implémenté par la feature employeuse (ACL). L'inscription ne connaît ni
 * `main`, ni l'ordre des écritures, ni leur atomicité : elle décide seulement
 * quand rattacher, et ce qu'il faut conclure d'un échec.
 */
export type RattacherEmployeuse = (input: {
  readonly userId: UserId
  readonly structureEmployeuse: StructureEmployeuseInput
}) => Promise<'rattachee' | 'indisponible'>

/**
 * Projette l'état d'inscription reçu, qui porte déjà l'étape franchie. Séparé
 * du rattachement parce que les deux appartiennent à des features distinctes :
 * l'emploi est à l'employeuse, l'avancement du parcours à l'inscription.
 */
export type ProjeterEtapeFranchie = (etat: InscriptionEnCours) => Promise<void>
