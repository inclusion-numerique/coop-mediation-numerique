import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { UtilisateurId } from '../../../../domain'
import { recalculerLesPremiersAccompagnements } from '../../../../implementations/prisma/premier-accompagnement.mutation'
import type { SupprimerLActiviteDeMediation } from '../../domain'

export const supprimerLActiviteDeMediation =
  (auteurId: UtilisateurId): SupprimerLActiviteDeMediation =>
  async ({
    activite: { id, type, suivis, anonymesOrphelins },
    suppression,
  }) => {
    await prismaClient.$transaction(async (transaction) => {
      await transaction.accompagnement.deleteMany({ where: { activiteId: id } })
      await transaction.activitesTags.deleteMany({ where: { activiteId: id } })
      await transaction.beneficiaire.deleteMany({
        where: { id: { in: [...anonymesOrphelins] }, anonyme: true },
      })
      await transaction.activite.update({
        where: { id },
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
