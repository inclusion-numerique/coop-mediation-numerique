import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { UtilisateurId } from '../../../../domain'
import { recalculerLesPremiersAccompagnements } from '../../../../implementations/prisma/premier-accompagnement.mutation'
import type { SupprimerLActiviteDeMediation } from '../../domain'

export const supprimerLActiviteDeMediation =
  (auteurId: UtilisateurId): SupprimerLActiviteDeMediation =>
  async ({
    activite: { id, type, mediateurId, suivis, anonymesOrphelins },
    suppression,
  }) => {
    await prismaClient.$transaction(async (transaction) => {
      await transaction.accompagnement.deleteMany({
        where: { activiteId: id, activite: { mediateurId, suppression: null } },
      })
      await transaction.activitesTags.deleteMany({
        where: { activiteId: id, activite: { mediateurId, suppression: null } },
      })
      await transaction.beneficiaire.deleteMany({
        where: {
          id: { in: [...anonymesOrphelins] },
          mediateurId,
          anonyme: true,
        },
      })
      await transaction.activite.updateMany({
        where: { id, mediateurId, suppression: null },
        data: {
          suppression,
          modification: suppression,
          rdvId: null,
        },
      })
      await recalculerLesPremiersAccompagnements(transaction, suivis)
    })

    addMutationLog({
      userId: auteurId,
      nom: 'SupprimerActivite',
      data: { type, id },
    })
  }
