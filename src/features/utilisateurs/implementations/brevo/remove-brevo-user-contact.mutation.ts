import { brevoActif } from '@/configuration/brevo'
import { listeDesUtilisateurs } from '@/features/utilisateurs/implementations/brevo/brevo-api.client'
import { deleteBrevoContactIfOrphan } from '@/features/utilisateurs/implementations/brevo/delete-brevo-contact-if-orphan.mutation'
import { removeBrevoContactFromList } from '@/features/utilisateurs/implementations/brevo/remove-brevo-contact-from-list.mutation'

export const removeBrevoUserContact = async (
  email: string,
): Promise<boolean> => {
  if (!brevoActif()) return false

  await removeBrevoContactFromList(email, listeDesUtilisateurs)
  await deleteBrevoContactIfOrphan(email)

  return true
}
