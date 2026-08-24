import type { AppliquerDispositif } from '@app/web/features/inscription/abilities/initialiser-inscription/domain'
import {
  dispositifDepuisMain,
  profilDepuisDispositif,
} from '@app/web/features/inscription/dispositifDepuisMain'
import { garantirCoordinateurDuDispositif } from '@app/web/features/utilisateurs/use-cases/dispositif/garantirCoordinateurDuDispositif'
import { prismaClient } from '@app/web/prismaClient'

/** Crée le médiateur s'il manque — jamais de suppression, comme auparavant. */
const garantirMediateur = async (userId: string): Promise<void> => {
  const existant = await prismaClient.mediateur.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (existant) return

  await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
}

/**
 * Le dispositif se lit dans `main` — plus d'appel à l'API Dataspace. La bascule
 * ne change pas les règles du parcours : « connu du dispositif » remplace
 * « trouvé dans l'API », et le profil se déduit de la même table de décision.
 *
 * Ce qui disparaît, c'est la recopie : l'ancien chemin écrivait
 * `is_conseiller_numerique`, `dataspace_id` et `dataspace_user_id_pg` sur
 * `coop.users`. Ces colonnes n'existent plus, et tout ce qui les lisait dérive
 * l'information par jointure.
 *
 * ⚠ LES LIEUX D'ACTIVITÉ NE SONT PLUS PRÉ-REMPLIS. L'API Dataspace fournissait
 * les lieux connus du dispositif, et l'inscription les importait une fois pour
 * toutes. `main` ne peut pas prendre le relais : ses affectations lieu
 * (`main.personne_affectations_lieu`) sont une VUE construite sur
 * `coop.mediateurs_en_activite`, donc sur ce que la coop sait déjà — il n'existe
 * aucune affectation lieu d'origine `idposte`. Conséquence assumée : un
 * conseiller numérique qui s'inscrit déclare ses lieux à l'étape
 * `lieux-activite`, où le parcours l'emmène déjà faute de lieu existant.
 */
export const appliquerDispositif: AppliquerDispositif = async ({ userId }) => {
  const dispositif = await dispositifDepuisMain(userId)
  const profilInscription = profilDepuisDispositif(dispositif)

  if (profilInscription) {
    await prismaClient.user.update({
      where: { id: userId },
      data: { profilInscription },
      select: { id: true },
    })
  }

  // Le rôle coordinateur suit la même règle qu'avant : coordinateur ET dans le
  // dispositif. La garantie est celle de la connexion et du job nocturne — une
  // seule définition, plusieurs appelants.
  await garantirCoordinateurDuDispositif(userId)

  if (dispositif.estConseillerNumerique && !dispositif.estCoordinateur) {
    await garantirMediateur(userId)
  }

  return {
    connue: dispositif.connue,
    estConseillerNumerique: dispositif.estConseillerNumerique,
  }
}
