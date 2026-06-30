import type { Franchissement } from './franchissement'
import type { ProfilInscription } from './profil-inscription'
import type { UserId } from './user-id'

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
  readonly userId: UserId
}

/** Profil choisi + CGU acceptées, inscription pas encore validée. */
export type InscriptionEnCours = {
  readonly _tag: 'EnCours'
  readonly userId: UserId
  readonly profil: ProfilInscription
  readonly acceptationCgu: Date
  readonly progression: ProgressionEtapes
}

/** État terminal : inscription validée. */
export type InscriptionValidee = {
  readonly _tag: 'Validee'
  readonly userId: UserId
  readonly profil: ProfilInscription
  readonly acceptationCgu: Date
  readonly progression: ProgressionEtapes
  readonly inscriptionValidee: Date
}

export type InscriptionEtat =
  | InscriptionNonDemarree
  | InscriptionEnCours
  | InscriptionValidee

export const isNonDemarree = (
  etat: InscriptionEtat,
): etat is InscriptionNonDemarree => etat._tag === 'NonDemarree'

export const isEnCours = (etat: InscriptionEtat): etat is InscriptionEnCours =>
  etat._tag === 'EnCours'

export const isValidee = (etat: InscriptionEtat): etat is InscriptionValidee =>
  etat._tag === 'Validee'

export const profilDeLInscription = (
  etat: InscriptionEtat,
): ProfilInscription | null =>
  etat._tag === 'NonDemarree' ? null : etat.profil
