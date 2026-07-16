import { Franchissement } from './franchissement'
import type {
  InscriptionEnCours,
  InscriptionNonDemarree,
  InscriptionValidee,
  ProgressionEtapes,
} from './inscription-etat'
import type { Role } from './role'

/**
 * Les transitions sont les seules fabriques d'un état d'inscription : chacune
 * part d'un état existant et en rend un nouveau. Les états de départ illégaux
 * sont écartés par la signature, pas par une garde à l'exécution — d'où
 * l'absence de `Result` ici : il n'y a rien à refuser, seulement des appels qui
 * ne compilent pas.
 */

const progressionVierge: ProgressionEtapes = {
  structureEmployeuse: Franchissement(null),
  lieuxActivite: Franchissement(null),
}

/**
 * Choix — ou re-choix — du rôle, les CGU étant acceptées au même instant. Un
 * retour arrière sur `choisir-role` conserve les étapes déjà franchies (changer
 * de rôle ne rembobine pas le parcours) et le statut conseiller numérique. Un
 * premier choix part non conseiller numérique : un CN ne franchit jamais cette
 * étape (il est routé avant, à l'initialisation).
 */
export const poserRole = (
  etat: InscriptionNonDemarree | InscriptionEnCours,
  role: Role,
  le: Date,
): InscriptionEnCours => ({
  _tag: 'EnCours',
  userId: etat.userId,
  role,
  conseillerNumerique:
    etat._tag === 'EnCours' ? etat.conseillerNumerique : false,
  acceptationCgu: le,
  progression: etat._tag === 'EnCours' ? etat.progression : progressionVierge,
})

export const franchirStructureEmployeuse = (
  etat: InscriptionEnCours,
  le: Date,
): InscriptionEnCours => ({
  ...etat,
  progression: { ...etat.progression, structureEmployeuse: Franchissement(le) },
})

export const franchirLieuxActivite = (
  etat: InscriptionEnCours,
  le: Date,
): InscriptionEnCours => ({
  ...etat,
  progression: { ...etat.progression, lieuxActivite: Franchissement(le) },
})

/**
 * Validation de l'inscription. La garde « pas de compte validé sans profil de
 * rôle » née de l'incident des comptes fantômes n'est pas rejouée ici : elle est
 * portée par la signature, `InscriptionEnCours` garantissant un profil, donc un
 * compte de rôle posé par `choisir-profil`.
 */
export const valider = (
  etat: InscriptionEnCours,
  le: Date,
): InscriptionValidee => ({ ...etat, _tag: 'Validee', inscriptionValidee: le })
