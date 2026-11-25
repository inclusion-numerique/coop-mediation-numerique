import {
  EtapeDInscription,
  type ValeurDEtapeDInscription,
} from './etape-d-inscription'
import {
  conseillerNumeriqueDeLInscription,
  type InscriptionEtat,
  type ProgressionEtapes,
  profilDeLInscription,
} from './etat-de-l-inscription'
import { estFranchi } from './franchissement'
import {
  etapeSuivante,
  type InscriptionContexte,
} from './parcours-d-inscription'
import type { TypeDeParcours } from './type-de-parcours'

export type ContexteParcours = {
  readonly flowType: TypeDeParcours
  readonly hasLieuxActivite: boolean
}

const porteFranchie: Partial<
  Record<ValeurDEtapeDInscription, (progression: ProgressionEtapes) => boolean>
> = {
  'choisir-role': () => true,
  'verifier-informations': (p) => estFranchi(p.structureEmployeuse),
  'lieux-activite': (p) => estFranchi(p.lieuxActivite),
}

const etapeFranchie = (
  step: EtapeDInscription,
  etat: InscriptionEtat,
): boolean => {
  if (etat._tag === 'NonDemarree') return false
  const value: ValeurDEtapeDInscription = step
  return porteFranchie[value]?.(etat.progression) ?? false
}

const avancer = (
  step: EtapeDInscription,
  etat: InscriptionEtat,
  contexte: InscriptionContexte,
): EtapeDInscription => {
  if (!etapeFranchie(step, etat)) return step
  const suivante = etapeSuivante(step, contexte)
  return suivante === null
    ? EtapeDInscription('recapitulatif')
    : avancer(suivante, etat, contexte)
}

export const prochaineEtape = (
  etat: InscriptionEtat,
  { flowType, hasLieuxActivite }: ContexteParcours,
): EtapeDInscription => {
  const contexte: InscriptionContexte = {
    flowType,
    profil: profilDeLInscription(etat),
    hasLieuxActivite,
    isConseillerNumerique: conseillerNumeriqueDeLInscription(etat),
  }

  const premiere = etapeSuivante(EtapeDInscription('initialize'), contexte)
  return premiere === null
    ? EtapeDInscription('recapitulatif')
    : avancer(premiere, etat, contexte)
}

export const peutValider = (
  etat: InscriptionEtat,
  contexte: ContexteParcours,
): boolean => prochaineEtape(etat, contexte) === 'recapitulatif'
