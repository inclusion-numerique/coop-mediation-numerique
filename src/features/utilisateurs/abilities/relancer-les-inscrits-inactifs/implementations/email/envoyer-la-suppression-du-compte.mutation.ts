import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { compteSupprime } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementations/email/compte-supprime.email'
import {
  type EnvoyerLAvisDEffacement,
  mediateurDe,
} from '@/features/utilisateurs/domain'
import { compileMjml } from '@/libraries/emails/rendu'
import { attraperEnEchecTechnique } from '@/libraries/result'

const envoyer = async ({
  email,
  isMediateur,
}: {
  email: string
  isMediateur: boolean
}) => {
  const result = await emailTransport.sendMail({
    to: email,
    from: expediteur,
    replyTo: contactEmail(),
    subject: 'Votre compte a été supprimé',
    text: compteSupprime.text({ isMediateur }),
    html: await compileMjml(compteSupprime.mjml({ isMediateur })),
  })

  throwOnSendMailFailure(result)
}

export const envoyerLaSuppressionDuCompte: EnvoyerLAvisDEffacement = (
  destinataire,
) =>
  attraperEnEchecTechnique(envoyer)({
    email: destinataire.courriel,
    isMediateur: mediateurDe(destinataire.rattachements) !== null,
  })
