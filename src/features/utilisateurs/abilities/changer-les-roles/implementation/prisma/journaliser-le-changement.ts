import type {
  AuteurId,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import type { PlanDeChangement } from '../../domain'

export const journaliserLeChangement = ({
  utilisateurId,
  auteurId,
  plan,
  duree,
}: {
  readonly utilisateurId: UtilisateurId
  readonly auteurId: AuteurId | null
  readonly plan: PlanDeChangement
  readonly duree: number
}): void =>
  addMutationLog({
    userId: auteurId,
    nom: 'ChangerRoles',
    duration: duree,
    data: {
      id: utilisateurId,
      operations: plan.operations.map(({ _tag }) => _tag),
      profil: plan.profil,
    },
  })
