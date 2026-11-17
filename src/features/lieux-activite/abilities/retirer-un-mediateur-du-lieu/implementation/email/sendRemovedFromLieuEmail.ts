import { removedFromLieuEmail } from '@app/web/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/implementation/email/removedFromLieuEmail'
import { compileMjml } from '@app/web/libraries/emails/mjml'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { emailTransport } from '@app/web/server/email/emailTransport'
import { throwOnSendMailFailure } from '@app/web/server/email/throwOnSendMailFailure'

export const sendRemovedFromLieuEmail = async ({
  mediateurEmail,
  mediateurFirstname,
  structureNom,
  removedByName,
}: {
  mediateurEmail: string
  mediateurFirstname: string | null
  structureNom: string
  removedByName: string
}) => {
  const result = await emailTransport.sendMail({
    to: mediateurEmail,
    from: ServerWebAppConfig.Email.from,
    replyTo: PublicWebAppConfig.contactEmail,
    subject: `Vous avez été retiré du lieu ${structureNom}`,
    text: removedFromLieuEmail.text({
      mediateurFirstname,
      structureNom,
      removedByName,
    }),
    html: await compileMjml(
      removedFromLieuEmail.mjml({
        mediateurFirstname,
        structureNom,
        removedByName,
      }),
    ),
  })

  throwOnSendMailFailure(result)
}
