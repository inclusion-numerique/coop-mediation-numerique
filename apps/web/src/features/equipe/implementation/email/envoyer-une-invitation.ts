import { compileMjml } from '@app/emails/mjml'
import { inviteMediateur } from '@app/emails/templates/inviteMediateur'
import { inviteNewMediateur } from '@app/emails/templates/inviteNewMediateur'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { emailTransport } from '@app/web/server/email/emailTransport'
import { throwOnSendMailFailure } from '@app/web/server/email/throwOnSendMailFailure'
import type { Invite, LienInvitation } from '../../domain'

const gabarits = {
  SansCompte: inviteNewMediateur,
  MediateurInscrit: inviteMediateur,
} as const

export const envoyerUneInvitation = async ({
  invite,
  lien,
  de,
}: {
  invite: Invite
  lien: LienInvitation
  de: string
}): Promise<void> => {
  const gabarit = gabarits[invite.type]

  const resultat = await emailTransport.sendMail({
    to: invite.email,
    from: ServerWebAppConfig.Email.from,
    replyTo: PublicWebAppConfig.contactEmail,
    subject:
      'Invitation à rejoindre une équipe sur La Coop de la médiation numérique',
    text: gabarit.text({ url: lien, from: de }),
    html: await compileMjml(gabarit.mjml({ url: lien, from: de })),
  })

  throwOnSendMailFailure(resultat)
}
