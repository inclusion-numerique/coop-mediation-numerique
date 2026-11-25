import type { Prisma } from '@/generated/prisma/client'
import { enSerie } from '@/libraries/fixtures'

export type InvitationEquipeFixture = {
  email: string
  coordinateurId: string
  mediateurId: string | null
}

export const enregistrerLesInvitations =
  (transaction: Prisma.TransactionClient) =>
  async (invitations: InvitationEquipeFixture[]) => {
    await enSerie(invitations, ({ email, coordinateurId, mediateurId }) =>
      transaction.invitationEquipe.upsert({
        where: {
          email_coordinateurId: { email, coordinateurId },
        },
        create: {
          email,
          coordinateurId,
          mediateurId,
        },
        update: {
          mediateurId,
        },
      }),
    )
  }
