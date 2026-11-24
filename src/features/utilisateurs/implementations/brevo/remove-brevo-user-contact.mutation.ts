import { brevoActif } from '@/configuration/brevo'
import { listeDesUtilisateurs } from '@/features/utilisateurs/implementations/brevo/brevo-api.client'
import { deleteBrevoContactIfOrphan } from '@/features/utilisateurs/implementations/brevo/delete-brevo-contact-if-orphan.mutation'
import { removeBrevoContactFromList } from '@/features/utilisateurs/implementations/brevo/remove-brevo-contact-from-list.mutation'

/**
 * Sort un utilisateur de Brevo : retrait de la liste des utilisateurs, puis
 * suppression du contact s'il n'appartient plus à aucune liste.
 *
 * La garde de déploiement vit ICI et non chez l'appelant. Les environnements de
 * prévisualisation partagent la liste de production : y retirer un contact
 * désabonnerait quelqu'un de bien réel. S'abstenir est donc un succès sans
 * effet, pas un échec — d'où le booléen plutôt qu'une exception. Laisser la
 * garde à l'appelant, c'est parier qu'aucun n'oubliera de la poser.
 */
export const removeBrevoUserContact = async (
  email: string,
): Promise<boolean> => {
  if (!brevoActif()) return false

  await removeBrevoContactFromList(email, listeDesUtilisateurs)
  await deleteBrevoContactIfOrphan(email)

  return true
}
