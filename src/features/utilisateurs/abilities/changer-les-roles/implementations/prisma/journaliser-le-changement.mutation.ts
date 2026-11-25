import { addMutationLog } from '@/configuration/prisma'
import type { AuteurId, UtilisateurId } from '@/features/utilisateurs/domain'
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
    },
  })
