import type { Prisma } from '@app/web/generated/prisma/client'
import { enSerie } from '@app/web/libraries/fixtures/enSerie'

export type InvitationEquipeFixture = {
  email: string
  coordinateurId: string
  mediateurId: string | null
}

export const upsertInvitationEquipeFixtures =
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
