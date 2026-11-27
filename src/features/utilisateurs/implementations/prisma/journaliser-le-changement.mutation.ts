import { addMutationLog } from '@/configuration/prisma'
import type {
  AuteurDuChangement,
  AuteurId,
  JournaliserLeChangement,
} from '@/features/utilisateurs/domain'

const auteurJournalise = (auteur: AuteurDuChangement): AuteurId | null =>
  auteur._tag === 'administrateur' ? auteur.administrateurId : null

export const journaliserLeChangement: JournaliserLeChangement = ({
  utilisateurId,
  auteur,
  plan,
}) =>
  addMutationLog({
    userId: auteurJournalise(auteur),
    nom: 'ChangerRoles',
    data: {
      id: utilisateurId,
      operations: plan.operations.map(({ _tag }) => _tag),
    },
  })
