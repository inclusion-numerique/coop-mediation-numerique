import { nouveauAccountDeletedEmail } from '@app/web/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementation/email/nouveauAccountDeletedEmail'
import { compileMjml } from '@app/web/libraries/emails/mjml'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { emailTransport } from '@app/web/server/email/emailTransport'
import { throwOnSendMailFailure } from '@app/web/server/email/throwOnSendMailFailure'

export const sendNouveauAccountDeletedEmail = async ({
  email,
  isMediateur,
}: {
  email: string
  isMediateur: boolean
}) => {
  const result = await emailTransport.sendMail({
    to: email,
    from: ServerWebAppConfig.Email.from,
    replyTo: PublicWebAppConfig.contactEmail,
    subject: 'Votre compte a été supprimé',
    text: nouveauAccountDeletedEmail.text({ isMediateur }),
    html: await compileMjml(nouveauAccountDeletedEmail.mjml({ isMediateur })),
  })

  throwOnSendMailFailure(result)
}
