import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { retraitDuLieu } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/implementations/email/retrait-du-lieu.email'
import { compileMjml } from '@/libraries/emails/rendu'

export const envoyerLeRetraitDuLieu = async ({
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
    from: expediteur,
    replyTo: contactEmail(),
    subject: `Vous avez été retiré du lieu ${structureNom}`,
    text: retraitDuLieu.text({
      mediateurFirstname,
      structureNom,
      removedByName,
    }),
    html: await compileMjml(
      retraitDuLieu.mjml({
        mediateurFirstname,
        structureNom,
        removedByName,
      }),
    ),
  })

  throwOnSendMailFailure(result)
}
