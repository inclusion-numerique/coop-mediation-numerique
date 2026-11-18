import { PublicWebAppConfig } from '@/configuration/projet/PublicWebAppConfig'
import { ServerWebAppConfig } from '@/configuration/projet/ServerWebAppConfig'
import { emailTransport } from '@/configuration/smtp/emailTransport'
import { throwOnSendMailFailure } from '@/configuration/smtp/throwOnSendMailFailure'
import { removedFromLieuEmail } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/implementation/email/removedFromLieuEmail'
import { compileMjml } from '@/libraries/emails/mjml'

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
