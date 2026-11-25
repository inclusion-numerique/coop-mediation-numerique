import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { invitationDUnMediateur } from '@/features/equipe/implementations/email/invitation-d-un-mediateur.email'
import { invitationDUnNouveauMediateur } from '@/features/equipe/implementations/email/invitation-d-un-nouveau-mediateur.email'
import { compileMjml } from '@/libraries/emails/rendu'
import {
  type InvitationEnAttente,
  lienInvitation,
  type NomAffiche,
} from '../../domain'

const gabarits = {
  SansCompte: invitationDUnNouveauMediateur,
  MediateurInscrit: invitationDUnMediateur,
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
    replyTo: contactEmail(),
    subject:
      'Invitation à rejoindre une équipe sur La Coop de la médiation numérique',
    text: gabarit.text({ url: lien, from: de }),
    html: await compileMjml(gabarit.mjml({ url: lien, from: de })),
  })

  throwOnSendMailFailure(resultat)
}
