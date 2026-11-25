import { prismaClient } from '@/configuration/prisma'
import type {
  AppliquerDispositif,
  GarantirLeRoleCoordinateur,
} from '@/features/inscription/abilities/initialiser-inscription/domain'
import { profilDepuisDispositif } from '@/features/inscription/domain'
import type { SynchroniserLaPersonne } from '@/features/inscription/implementations/prisma/synchroniser-la-personne.mutation'
import { dispositifDepuisMain } from './dispositif-depuis-main.query'

/** Crée le médiateur s'il manque — jamais de suppression, comme auparavant. */
const garantirMediateur = async (
  userId: string,
  synchroniserLaPersonne: SynchroniserLaPersonne,
): Promise<void> => {
  const existant = await prismaClient.mediateur.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (existant) return

  await prismaClient.$transaction(async (transaction) => {
    await transaction.mediateur.create({
      data: { userId },
      select: { id: true },
    })
    await synchroniserLaPersonne(transaction, userId)
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
export const appliquerDispositif =
  (
    garantirLeRoleCoordinateur: GarantirLeRoleCoordinateur,
    synchroniserLaPersonne: SynchroniserLaPersonne,
  ): AppliquerDispositif =>
  async ({ userId }) => {
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
    await garantirLeRoleCoordinateur(userId)

    if (dispositif.estConseillerNumerique && !dispositif.estCoordinateur) {
      await garantirMediateur(userId, synchroniserLaPersonne)
    }

    return {
      connue: dispositif.connue,
      estConseillerNumerique: dispositif.estConseillerNumerique,
    }
  }
