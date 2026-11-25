import { addMutationLog } from '@/configuration/prisma'
import type { AuteurId, UtilisateurId } from '@/features/utilisateurs/domain'
import type { PlanDeChangement } from '../../domain'

export const journaliserLeChangement = ({
  utilisateurId,
  auteurId,
  plan,
}: {
  readonly utilisateurId: UtilisateurId
  readonly auteurId: AuteurId | null
  readonly plan: PlanDeChangement
}): void =>
  addMutationLog({
    userId: auteurId,
    nom: 'ChangerRoles',
    data: {
      id: utilisateurId,
      operations: plan.operations.map(({ _tag }) => _tag),
    },
  })
