import { removeBrevoUserContact } from '@/features/utilisateurs/implementations/brevo/remove-brevo-user-contact.mutation'
import { enEchecTechnique, failure, success } from '@/libraries/result'
import type { RetirerDesListesDeDiffusion } from '../../domain'

export const retirerDesListesDeDiffusion: RetirerDesListesDeDiffusion = async (
  courriel,
) => {
  try {
    return success(await removeBrevoUserContact(courriel))
  } catch (erreur) {
    return failure(enEchecTechnique(erreur))
  }
}
