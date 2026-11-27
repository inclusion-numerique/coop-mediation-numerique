import type { Franchissement } from './franchissement'
import {
  type ProfilInscription,
  profilDInscription,
} from './profil-inscription'
import type { Role } from './role'
import type { UtilisateurId } from './utilisateur-id'

export type ProgressionEtapes = {
  readonly structureEmployeuse: Franchissement
  readonly lieuxActivite: Franchissement
}

export type InscriptionNonDemarree = {
  readonly _tag: 'NonDemarree'
  readonly userId: UtilisateurId
}

export type InscriptionEnCours = {
  readonly _tag: 'EnCours'
  readonly userId: UtilisateurId
  readonly role: Role
  readonly conseillerNumerique: boolean
  readonly acceptationCgu: Date | null
  readonly progression: ProgressionEtapes
}

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

export const profilDeLInscription = (
  etat: InscriptionEtat,
): ProfilInscription | null =>
  etat._tag === 'NonDemarree'
    ? null
    : profilDInscription({
        isConseillerNumerique: etat.conseillerNumerique,
        isCoordinateur: etat.role === 'Coordinateur',
      })
