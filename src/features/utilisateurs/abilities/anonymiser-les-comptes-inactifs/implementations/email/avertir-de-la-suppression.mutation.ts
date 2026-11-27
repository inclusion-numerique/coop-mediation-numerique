import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { inactiviteProlongeeAvertissementEmail } from '@/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs/implementations/email/avertissement-d-inactivite-prolongee.email'
import { formatInTimeZone } from '@/libraries/date'
import { compileMjml } from '@/libraries/emails/rendu'
import { enEchecTechnique, failure, success } from '@/libraries/result'
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

  try {
    const resultat = await emailTransport.sendMail({
      to: courriel,
      from: expediteur,
      replyTo: contactEmail(),
      subject: 'Votre compte va bientôt être supprimé ⚠️',
      text: inactiviteProlongeeAvertissementEmail.text(contenu),
      html: await compileMjml(
        inactiviteProlongeeAvertissementEmail.mjml(contenu),
      ),
    })

    throwOnSendMailFailure(resultat)
    return success(undefined)
  } catch (erreur) {
    return failure(enEchecTechnique(erreur))
  }
}
