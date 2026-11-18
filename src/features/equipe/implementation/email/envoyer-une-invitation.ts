import { inviteMediateur } from '@/features/equipe/implementation/email/inviteMediateur'
import { inviteNewMediateur } from '@/features/equipe/implementation/email/inviteNewMediateur'
import { compileMjml } from '@/libraries/emails/mjml'
import { PublicWebAppConfig } from '@/PublicWebAppConfig'
import { ServerWebAppConfig } from '@/ServerWebAppConfig'
import { emailTransport } from '@/server/email/emailTransport'
import { throwOnSendMailFailure } from '@/server/email/throwOnSendMailFailure'
import {
  type InvitationEnAttente,
  lienInvitation,
  type NomAffiche,
} from '../../domain'

const gabarits = {
  SansCompte: inviteNewMediateur,
  MediateurInscrit: inviteMediateur,
} as const

export const envoyerUneInvitation = async ({
  invitation,
  de,
}: {
  invitation: InvitationEnAttente
  de: NomAffiche
}): Promise<void> => {
  const gabarit = gabarits[invitation.invite.type]
  const lien = lienInvitation(invitation.reference)

  const resultat = await emailTransport.sendMail({
    to: invitation.reference.email,
    from: ServerWebAppConfig.Email.from,
    replyTo: PublicWebAppConfig.contactEmail,
    subject:
      'Invitation à rejoindre une équipe sur La Coop de la médiation numérique',
    text: gabarit.text({ url: lien, from: de }),
    html: await compileMjml(gabarit.mjml({ url: lien, from: de })),
  })

  throwOnSendMailFailure(resultat)
}
