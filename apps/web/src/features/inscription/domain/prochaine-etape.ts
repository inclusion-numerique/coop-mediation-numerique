import { estFranchi } from './franchissement'
import {
  conseillerNumeriqueDeLInscription,
  type InscriptionEtat,
  profilDeLInscription,
} from './inscription-etat'
import {
  getNextInscriptionStep,
  type InscriptionContexte,
} from './inscription-flow'
import type { InscriptionFlowType } from './inscription-flow-type'
import { InscriptionStep } from './inscription-step'

/**
 * Les signaux du parcours qui ne vivent pas dans l'état d'inscription : type de
 * flow et présence de lieux (dérivés des données Dataspace). Le rôle et le
 * statut conseiller numérique, eux, sont lus depuis l'état — sa source de vérité.
 */
export type ContexteParcours = {
  readonly flowType: InscriptionFlowType
  readonly hasLieuxActivite: boolean
}

/**
 * Porte de l'étape : est-elle déjà franchie au vu de l'état ? `choisir-role` est
 * franchie dès qu'un profil est posé (⇔ pas `NonDemarree`) ; `verifier-informations`
 * et `lieux-activite` par leur `Franchissement` respectif. Le récapitulatif est
 * terminal — ce n'est pas une porte à franchir.
 */
const etapeFranchie = (
  step: InscriptionStep,
  etat: InscriptionEtat,
): boolean => {
  if (etat._tag === 'NonDemarree') return false
  if (step === 'choisir-role') return true
  if (step === 'verifier-informations')
    return estFranchi(etat.progression.structureEmployeuse)
  if (step === 'lieux-activite')
    return estFranchi(etat.progression.lieuxActivite)
  return false
}

/**
 * Avance dans le parcours tant que l'étape courante est franchie. S'arrête sur la
 * première étape non franchie (le point de reprise). Une étape franchie sans
 * successeur signifie « parcours terminé » : on rend `recapitulatif`.
 */
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

/**
 * Position de reprise : première étape du parcours (dont la séquence est définie
 * par le flow du profil) qui n'est pas encore franchie. Le flow reste l'autorité
 * de la séquence ; cette projection n'ajoute que la lecture de la complétion
 * (`progression`) — les deux ne peuvent donc pas diverger. `recapitulatif`
 * signifie « plus rien à franchir ».
 */
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

/**
 * Gating de validation : l'inscription est validable quand il ne reste plus
 * aucune étape à franchir avant le récapitulatif. Reprise et gating tombent de la
 * même projection — une seule source de vérité.
 */
export const peutValider = (
  etat: InscriptionEtat,
  contexte: ContexteParcours,
): boolean => prochaineEtape(etat, contexte) === 'recapitulatif'
