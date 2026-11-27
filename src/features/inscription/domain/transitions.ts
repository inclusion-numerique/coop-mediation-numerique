import type {
  InscriptionEnCours,
  InscriptionNonDemarree,
  InscriptionValidee,
  ProgressionEtapes,
} from './etat-de-l-inscription'
import { Franchissement } from './franchissement'
import type { Role } from './role'

const progressionVierge: ProgressionEtapes = {
  structureEmployeuse: Franchissement(null),
  lieuxActivite: Franchissement(null),
}

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

export const valider = (
  etat: InscriptionEnCours,
  le: Date,
): InscriptionValidee => ({ ...etat, _tag: 'Validee', inscriptionValidee: le })
