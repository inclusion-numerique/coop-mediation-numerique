import {
  creerLieuActivite,
  MediateurId,
  nouveauLieu,
  UserId,
} from '@app/web/features/lieux-activite'
import type { EnregistrerLeLieuSaisi } from '../domain'

/**
 * Jonction entre le besoin de l'inscription et l'ability qui sait créer un lieu.
 * C'est ici, et nulle part en amont, que les deux features se rencontrent : la
 * saisie devient un lieu du domaine, puis l'ability décide s'il faut le créer ou
 * rejoindre celui que la coop connaissait déjà.
 *
 * L'ability refuse un médiateur absent ; le port lui en fournit toujours un,
 * puisque le cas d'usage a résolu celui de l'acteur avant d'appeler. Cet échec
 * ne peut donc traduire qu'un invariant rompu, qu'on laisse remonter tel quel
 * plutôt que de le déguiser en erreur métier de l'inscription.
 */
export const enregistrerLeLieuSaisi: EnregistrerLeLieuSaisi = async ({
  userId,
  mediateurId,
  saisie,
}) => {
  const resultat = await creerLieuActivite({
    lieu: nouveauLieu(saisie, UserId(userId), new Date()),
    mediateurId: MediateurId(mediateurId),
  })

  if (!resultat.success)
    throw new Error(
      `Création du lieu refusée par l'ability : ${resultat.error._tag}`,
    )

  return resultat.data
}
