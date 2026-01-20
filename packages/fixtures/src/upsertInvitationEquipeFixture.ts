import type { Prisma } from '@prisma/client'

export type InvitationEquipeFixture = {
  email: string
  coordinateurId: string
  mediateurId: string | null
}

export const upsertInvitationEquipeFixtures =
  (transaction: Prisma.TransactionClient) =>
  async (invitations: InvitationEquipeFixture[]) => {
    await Promise.all(
      invitations.map(({ email, coordinateurId, mediateurId }) =>
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
      ),
    )
  }
