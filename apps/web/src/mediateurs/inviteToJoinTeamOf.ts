import type { CoordinateurUser } from '@app/web/auth/userTypeGuards'
import { createInvitationUrl } from '@app/web/features/invitation/createInvitationUrl'
import { prismaClient } from '@app/web/prismaClient'
import { sendInviteMediateurEmail } from './sendInviteMediateurEmail'
import { sendInviteNewMediateurEmail } from './sendInviteNewMediateurEmail'

const withInvitationFrom =
  (user: CoordinateurUser) =>
  ({ email }: { email: string }) => ({
    url: createInvitationUrl({ email, coordinateurId: user.coordinateur.id }),
    email,
    from: user,
  })

export const inviteToJoinTeamOf =
  (user: CoordinateurUser) =>
  async (members: { email: string; mediateurId?: string }[]) => {
    const existingInvitations = await prismaClient.invitationEquipe.findMany({
      where: {
        mediateurId: {
          in: user.coordinateur.mediateursCoordonnes.map(
            (item) => item.mediateurId,
          ),
        },
      },
      select: { email: true },
    })

    const existingTeamMembers = await prismaClient.mediateurCoordonne.findMany({
      where: {
        coordinateurId: user.coordinateur.id,
        suppression: null,
      },
      select: {
        mediateur: {
          select: {
            user: {
              select: { email: true },
            },
          },
        },
      },
    })

    const isAlreadyInvited = (email: string) =>
      existingInvitations.some(
        (invitation) => invitation.email.toLowerCase() === email.toLowerCase(),
      )

    const isAlreadyTeamMember = (email: string) =>
      existingTeamMembers.some(
        ({ mediateur }) =>
          mediateur.user.email.toLowerCase() === email.toLowerCase(),
      )

    const invitations = members
      .filter(
        (member) =>
          !isAlreadyInvited(member.email) && !isAlreadyTeamMember(member.email),
      )
      .map((member) => ({
        email: member.email.toLowerCase(),
        coordinateurId: user.coordinateur.id,
        acceptee: null,
        refusee: null,
        ...(member.mediateurId === member.email
          ? {}
          : { mediateurId: member.mediateurId }),
      }))

    if (invitations.length === 0) {
      throw new Error('No new invitations to send')
    }

    await Promise.all(
      invitations.map(async (invitation) =>
        invitation.mediateurId == null
          ? sendInviteNewMediateurEmail(withInvitationFrom(user)(invitation))
          : sendInviteMediateurEmail(withInvitationFrom(user)(invitation)),
      ),
    )

    return Promise.all(
      invitations.map(async (invitation) =>
        prismaClient.invitationEquipe.upsert({
          where: {
            email_coordinateurId: {
              email: invitation.email,
              coordinateurId: invitation.coordinateurId,
            },
          },
          update: invitation,
          create: invitation,
        }),
      ),
    )
  }
