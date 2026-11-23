import { contactEmail } from '@/configuration/projet/config'
import { emailTransport } from '@/configuration/smtp/emailTransport'
import { expediteur } from '@/configuration/smtp/serveur'
import { throwOnSendMailFailure } from '@/configuration/smtp/throwOnSendMailFailure'
import { inviteMediateur } from '@/features/equipe/implementations/email/invitation-d-un-mediateur'
import { inviteNewMediateur } from '@/features/equipe/implementations/email/invitation-d-un-nouveau-mediateur'
import { compileMjml } from '@/libraries/emails/mjml'
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
    from: expediteur,
    replyTo: contactEmail,
    subject:
      'Invitation à rejoindre une équipe sur La Coop de la médiation numérique',
    text: gabarit.text({ url: lien, from: de }),
    html: await compileMjml(gabarit.mjml({ url: lien, from: de })),
  })

  throwOnSendMailFailure(resultat)
}
