import { compileMjml } from '@app/emails/mjml'
import { inactiviteProlongeeAvertissementEmail } from '@app/emails/templates/inactiviteProlongeeAvertissementEmail'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { emailTransport } from '@app/web/server/email/emailTransport'
import { throwOnSendMailFailure } from '@app/web/server/email/throwOnSendMailFailure'
import { formatInTimeZone } from 'date-fns-tz'
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
    from: ServerWebAppConfig.Email.from,
    replyTo: PublicWebAppConfig.contactEmail,
    subject: 'Votre compte va bientôt être supprimé ⚠️',
    text: inactiviteProlongeeAvertissementEmail.text(contenu),
    html: await compileMjml(
      inactiviteProlongeeAvertissementEmail.mjml(contenu),
    ),
  })

  throwOnSendMailFailure(resultat)
}
