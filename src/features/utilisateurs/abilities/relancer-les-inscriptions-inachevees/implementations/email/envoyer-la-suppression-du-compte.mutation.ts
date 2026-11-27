import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { compteSupprime } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/email/compte-supprime.email'
import type { EnvoyerLAvisDEffacement } from '@/features/utilisateurs/domain'
import { compileMjml } from '@/libraries/emails/rendu'
import { attraperEnEchecTechnique } from '@/libraries/result'

const envoyer = async ({
  email,
  firstname,
}: {
  email: string
  firstname: string | null
}) => {
  const result = await emailTransport.sendMail({
    to: email,
    from: expediteur,
    replyTo: contactEmail(),

    subject: 'Votre compte a été supprimé',
    text: compteSupprime.text({ firstname }),
    html: await compileMjml(compteSupprime.mjml({ firstname })),
  })

  throwOnSendMailFailure(result)
}

export const envoyerLaSuppressionDuCompte: EnvoyerLAvisDEffacement = ({
  courriel,
  prenom,
}) => attraperEnEchecTechnique(envoyer)({ email: courriel, firstname: prenom })
