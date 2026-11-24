import { formatInTimeZone } from 'date-fns-tz'
import { contactEmail } from '@/configuration/projet/config'
import { emailTransport } from '@/configuration/smtp/email-transport'
import { expediteur } from '@/configuration/smtp/serveur'
import { throwOnSendMailFailure } from '@/configuration/smtp/throw-on-send-mail-failure'
import { inactiviteProlongeeAvertissementEmail } from '@/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs/implementations/email/avertissement-d-inactivite-prolongee.email'
import { compileMjml } from '@/libraries/emails/mjml'
import type { AvertirDeLaSuppression } from '../../domain'

export const avertirDeLaSuppression: AvertirDeLaSuppression = async ({
  courriel,
  prenom,
  dateDeSuppression,
}) => {
  const contenu = {
    firstname: prenom,
    dateDeSuppression: formatInTimeZone(
      dateDeSuppression,
      'Europe/Paris',
      'dd/MM/yyyy',
    ),
  }

  const resultat = await emailTransport.sendMail({
    to: courriel,
    from: expediteur,
    replyTo: contactEmail,
    subject: 'Votre compte va bientôt être supprimé ⚠️',
    text: inactiviteProlongeeAvertissementEmail.text(contenu),
    html: await compileMjml(
      inactiviteProlongeeAvertissementEmail.mjml(contenu),
    ),
  })

  throwOnSendMailFailure(resultat)
}
