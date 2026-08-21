import { output } from '@app/cli/output'
import { updateBrevoContact } from '@app/web/external-apis/brevo/updateBrevoContact'
import { garantirCoordinateurDuDispositif } from '@app/web/features/utilisateurs/use-cases/dispositif/garantirCoordinateurDuDispositif'
import { prismaClient } from '@app/web/prismaClient'
import type { AppliquerDispositifConumJob } from './appliquerDispositifConumJob'

/**
 * Répercute dans la coop ce que l'Entrepôt vient de changer au dispositif conseiller numérique.
 *
 * Ce job REMPLACE `sync-users-from-dataspace`, qui appelait l'API Dataspace une fois par compte —
 * 6 000 requêtes HTTP par nuit — pour recopier dans `coop.users` quatre colonnes que `main` porte
 * déjà (`dataspace_id`, `dataspace_user_id_pg`, `is_conseiller_numerique`, l'horodatage de synchro).
 * Ces colonnes ont disparu : tout ce qui les lisait dérive désormais l'information par jointure.
 *
 * Il ne reste donc que ce qu'une lecture ne peut PAS faire, c'est-à-dire deux effets :
 *
 * 1. GARANTIR LA LIGNE `coop.coordinateurs`. Elle n'est pas un miroir : elle est la cible de clés
 *    étrangères dans tout le schéma coop (médiateurs coordonnés, invitations, tags, activités de
 *    coordination, partage de statistiques). On ne peut pas rattacher une invitation d'équipe à un
 *    booléen calculé. Ce qui vient du dispositif n'est pas la ligne, c'est le déclencheur de sa
 *    création — et, comme avant, on ne supprime jamais.
 *
 * 2. NOTIFIER BREVO. Un contact se met à jour sur une TRANSITION, et une valeur dérivée n'a pas
 *    d'« avant » : personne ne remarquerait qu'un compte entre ou sort du dispositif. C'est le seul
 *    endroit où supprimer la synchro faisait perdre une capacité, et non un simple intermédiaire.
 *
 * Ce qui rend la transition détectable sans stocker d'état : `main.personne_affectations_emploi`
 * porte un `updated_at` maintenu par trigger côté Entrepôt. Le job n'a donc pas besoin de mémoriser
 * le statut d'hier — il demande à `main` ce qui a bougé. Effet de bord bienvenu : il ne balaie plus
 * toute la population chaque nuit, seulement les comptes concernés.
 */

type CompteImpacte = {
  user_id: string
  est_conseiller_numerique: boolean
  est_coordinateur: boolean
  a_deja_coordinateur: boolean
}

/**
 * Comptes dont une affectation emploi a bougé dans la fenêtre.
 *
 * `created_at` compte autant que `updated_at` : une PREMIÈRE affectation est une entrée dans le
 * dispositif, et le trigger ne renseigne `updated_at` qu'aux modifications ultérieures.
 *
 * `main.*` est qualifié explicitement : le `search_path` (`coop,public`) ne l'inclut pas.
 */
const comptesImpactes = (depuis: Date): Promise<CompteImpacte[]> =>
  prismaClient.$queryRaw<CompteImpacte[]>`
    SELECT
      u.id AS user_id,
      EXISTS (
        SELECT 1 FROM main.personne_affectations_emploi a
        WHERE a.personne_id = p.id AND a.source = 'idposte' AND a.est_active
      ) AS est_conseiller_numerique,
      COALESCE(p.is_coordinateur, false) AS est_coordinateur,
      EXISTS (
        SELECT 1 FROM coop.coordinateurs c WHERE c.user_id = u.id
      ) AS a_deja_coordinateur
    FROM main.personne p
    JOIN coop.users u ON u.id = p.coop_id
    WHERE u.deleted IS NULL
      AND EXISTS (
        SELECT 1 FROM main.personne_affectations_emploi a
        WHERE a.personne_id = p.id
          AND COALESCE(a.updated_at, a.created_at) >= ${depuis}
      )
    ORDER BY u.id`

/**
 * Le rôle coordinateur suit la même règle qu'avant : il faut être coordinateur ET relever du
 * dispositif. Et il ne se retire jamais — un coordinateur qui perd le dispositif garde ses
 * rattachements, sans quoi on orphelinerait des équipes entières.
 */
const aCreerCoordinateur = (compte: CompteImpacte): boolean =>
  compte.est_coordinateur &&
  compte.est_conseiller_numerique &&
  !compte.a_deja_coordinateur

export const executeAppliquerDispositifConum = async (
  job: AppliquerDispositifConumJob,
) => {
  const depuisHeures = job.payload?.depuisHeures ?? 25
  const limiteBrevo = job.payload?.limiteBrevo ?? 500
  const forcerBrevo = job.payload?.forcerBrevo ?? false

  const depuis = new Date(Date.now() - depuisHeures * 60 * 60 * 1000)

  const comptes = await comptesImpactes(depuis)

  output(
    `[dispositif] ${comptes.length} compte(s) dont une affectation a bougé depuis ${depuis.toISOString()}`,
  )

  // Séquentiel et idempotent : le volume attendu se compte en dizaines, et la garantie est partagée
  // avec la connexion — une seule définition de « qui doit avoir une ligne coordinateur ».
  const coordinateursCrees = await comptes
    .filter(aCreerCoordinateur)
    .reduce<Promise<number>>(async (precedent, compte) => {
      const total = await precedent
      const { cree } = await garantirCoordinateurDuDispositif(compte.user_id)
      return cree ? total + 1 : total
    }, Promise.resolve(0))

  // Brevo ne reçoit que les comptes réellement touchés — c'est la transition qui l'intéresse.
  const brevoBorne = comptes.length > limiteBrevo && !forcerBrevo

  const brevoNotifies = brevoBorne
    ? 0
    : await comptes.reduce<Promise<number>>(async (precedent, compte) => {
        const total = await precedent
        const notifie = await updateBrevoContact(compte.user_id)
        return notifie ? total + 1 : total
      }, Promise.resolve(0))

  if (brevoBorne) {
    output(
      `[dispositif] ⚠ ${comptes.length} comptes touchés (> ${limiteBrevo}) : Brevo NON notifié. ` +
        `Signature d'un rechargement massif côté Entrepôt plutôt que de vraies transitions. ` +
        `Relancer avec { forcerBrevo: true } après vérification.`,
    )
  }

  const results = {
    depuis: depuis.toISOString(),
    comptesImpactes: comptes.length,
    conseillersNumeriques: comptes.filter((c) => c.est_conseiller_numerique)
      .length,
    coordinateursCrees,
    brevoNotifies,
    brevoBorne,
  }

  output(
    `[dispositif] terminé : ${results.comptesImpactes} impactés ; ` +
      `coordinateurs créés ${results.coordinateursCrees} ; ` +
      `Brevo ${brevoBorne ? 'borné' : `notifiés ${results.brevoNotifies}`}`,
  )

  return results
}
