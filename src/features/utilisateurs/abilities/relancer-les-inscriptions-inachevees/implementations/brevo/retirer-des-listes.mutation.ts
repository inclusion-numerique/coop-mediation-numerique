import {
  type AdresseCourriel,
  EchecTechnique,
} from '@/features/utilisateurs/domain'
import { removeBrevoUserContact } from '@/features/utilisateurs/implementations/brevo/remove-brevo-user-contact.mutation'
import { failure, type Result, success } from '@/libraries/result'

export const retirerDesListes = async (
  courriel: AdresseCourriel,
): Promise<Result<void, EchecTechnique>> => {
  try {
    await removeBrevoUserContact(courriel)
    return success(undefined)
  } catch (erreur) {
    return failure(
      EchecTechnique(erreur instanceof Error ? erreur.message : String(erreur)),
    )
  }
}
