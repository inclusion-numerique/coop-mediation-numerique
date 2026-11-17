import { formatInTimeZone } from 'date-fns-tz'
import { inactiviteProlongeeAvertissementEmail } from '@/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs/implementation/email/inactiviteProlongeeAvertissementEmail'
import { compileMjml } from '@/libraries/emails/mjml'
import { PublicWebAppConfig } from '@/PublicWebAppConfig'
import { ServerWebAppConfig } from '@/ServerWebAppConfig'
import { emailTransport } from '@/server/email/emailTransport'
import { throwOnSendMailFailure } from '@/server/email/throwOnSendMailFailure'
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
