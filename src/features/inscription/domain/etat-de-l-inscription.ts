import type { Franchissement } from './franchissement'
import {
  type ProfilInscription,
  profilDInscription,
} from './profil-inscription'
import type { Role } from './role'
import type { UtilisateurId } from './utilisateur-id'

/**
 * Les deux étapes intermédiaires voyagent toujours ensemble et sont
 * profil-dépendantes (un coordinateur validé n'a jamais renseigné structure ni
 * lieux). Composite plutôt que chaîne linéaire pour ne pas imposer de faux ordre.
 */
export type ProgressionEtapes = {
  readonly structureEmployeuse: Franchissement
  readonly lieuxActivite: Franchissement
}

/** Utilisateur authentifié, profil pas encore choisi : l'absence EST la variante. */
export type InscriptionNonDemarree = {
  readonly _tag: 'NonDemarree'
  readonly userId: UtilisateurId
}

/**
 * Profil posé, inscription pas encore validée. Le rôle (choix), le statut
 * conseiller numérique (fait Dataspace) et l'acceptation des CGU sont trois
 * champs orthogonaux — jamais un enum qui les aplatit.
 *
 * `acceptationCgu` est nullable : le parcours standard les pose à `choisir-role`,
 * mais le flow Dataspace pré-remplit le profil et ne les recueille qu'au
 * récapitulatif — « profil posé, CGU en attente » est donc un état légitime.
 */
export type InscriptionEnCours = {
  readonly _tag: 'EnCours'
  readonly userId: UtilisateurId
  readonly role: Role
  readonly conseillerNumerique: boolean
  readonly acceptationCgu: Date | null
  readonly progression: ProgressionEtapes
}

/** État terminal : inscription validée (les CGU y sont nécessairement posées). */
export type InscriptionValidee = {
  readonly _tag: 'Validee'
  readonly userId: UtilisateurId
  readonly role: Role
  readonly conseillerNumerique: boolean
  readonly acceptationCgu: Date | null
  readonly progression: ProgressionEtapes
  readonly inscriptionValidee: Date
}

export type InscriptionEtat =
  | InscriptionNonDemarree
  | InscriptionEnCours
  | InscriptionValidee

export const estNonDemarree = (
  etat: InscriptionEtat,
): etat is InscriptionNonDemarree => etat._tag === 'NonDemarree'

export const estValidee = (etat: InscriptionEtat): etat is InscriptionValidee =>
  etat._tag === 'Validee'

export const conseillerNumeriqueDeLInscription = (
  etat: InscriptionEtat,
): boolean => (etat._tag === 'NonDemarree' ? false : etat.conseillerNumerique)

/**
 * Profil d'inscription 4-valeurs, *dérivé* de (rôle, statut CN) — forme legacy
 * conservée pour le flow et l'affichage. La source de vérité reste les deux
 * champs de l'état ; ce profil n'est jamais stocké côté domaine.
 */
export const profilDeLInscription = (
  etat: InscriptionEtat,
): ProfilInscription | null =>
  etat._tag === 'NonDemarree'
    ? null
    : profilDInscription({
        isConseillerNumerique: etat.conseillerNumerique,
        isCoordinateur: etat.role === 'Coordinateur',
      })
