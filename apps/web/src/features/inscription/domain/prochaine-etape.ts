import { estFranchi } from './franchissement'
import {
  conseillerNumeriqueDeLInscription,
  type InscriptionEtat,
  type ProgressionEtapes,
  profilDeLInscription,
} from './inscription-etat'
import {
  getNextInscriptionStep,
  type InscriptionContexte,
} from './inscription-flow'
import type { InscriptionFlowType } from './inscription-flow-type'
import { InscriptionStep, type InscriptionStepValue } from './inscription-step'

export type ContexteParcours = {
  readonly flowType: InscriptionFlowType
  readonly hasLieuxActivite: boolean
}

const porteFranchie: Partial<
  Record<InscriptionStepValue, (progression: ProgressionEtapes) => boolean>
> = {
  'choisir-role': () => true,
  'verifier-informations': (p) => estFranchi(p.structureEmployeuse),
  'lieux-activite': (p) => estFranchi(p.lieuxActivite),
}

const etapeFranchie = (
  step: InscriptionStep,
  etat: InscriptionEtat,
): boolean => {
  if (etat._tag === 'NonDemarree') return false
  const value: InscriptionStepValue = step
  return porteFranchie[value]?.(etat.progression) ?? false
}

const avancer = (
  step: InscriptionStep,
  etat: InscriptionEtat,
  contexte: InscriptionContexte,
): InscriptionStep => {
  if (!etapeFranchie(step, etat)) return step
  const suivante = getNextInscriptionStep(step, contexte)
  return suivante === null
    ? InscriptionStep('recapitulatif')
    : avancer(suivante, etat, contexte)
}

export const prochaineEtape = (
  etat: InscriptionEtat,
  { flowType, hasLieuxActivite }: ContexteParcours,
): InscriptionStep => {
  const contexte: InscriptionContexte = {
    flowType,
    profil: profilDeLInscription(etat),
    hasLieuxActivite,
    isConseillerNumerique: conseillerNumeriqueDeLInscription(etat),
  }

  const premiere = getNextInscriptionStep(
    InscriptionStep('initialize'),
    contexte,
  )
  return premiere === null
    ? InscriptionStep('recapitulatif')
    : avancer(premiere, etat, contexte)
}

export const peutValider = (
  etat: InscriptionEtat,
  contexte: ContexteParcours,
): boolean => prochaineEtape(etat, contexte) === 'recapitulatif'
