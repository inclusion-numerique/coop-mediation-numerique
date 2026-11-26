import {
  EtapeDInscription,
  type ValeurDEtapeDInscription,
} from './etape-d-inscription'
import type { ProfilInscription } from './profil-inscription'
import { TypeDeParcours } from './type-de-parcours'

/**
 * Les quatre signaux qui pilotent la navigation. Toujours passés ensemble, donc
 * regroupés en composite d'entrée de la machine à états.
 */
export type InscriptionContexte = {
  readonly flowType: TypeDeParcours
  readonly profil: ProfilInscription | null
  readonly hasLieuxActivite: boolean
  readonly isConseillerNumerique: boolean
}

/** Une transition : depuis un step, si la garde passe, vers un step (ou fin). */
type Transition = {
  readonly de: ValeurDEtapeDInscription
  readonly si?: (contexte: InscriptionContexte) => boolean
  readonly vers: ValeurDEtapeDInscription | null
}

const premiereTransition = (
  table: readonly Transition[],
  courant: EtapeDInscription,
  contexte: InscriptionContexte,
): EtapeDInscription | null => {
  const vers = table.find(
    (transition) =>
      transition.de === courant && (transition.si?.(contexte) ?? true),
  )?.vers
  return vers == null ? null : EtapeDInscription(vers)
}

type Parcours = {
  readonly depart: (contexte: InscriptionContexte) => ValeurDEtapeDInscription
  readonly transitions: readonly Transition[]
}

/** Parcours complet : flow sans Dataspace, ou pour un non-conseiller numérique. */
const fluxStandard: Parcours = {
  depart: () => 'choisir-role',
  transitions: [
    {
      de: 'choisir-role',
      si: (c) => c.profil === 'Coordinateur',
      vers: 'recapitulatif',
    },
    { de: 'choisir-role', vers: 'verifier-informations' },
    {
      de: 'verifier-informations',
      si: (c) => c.profil === 'Mediateur' || c.profil === 'ConseillerNumerique',
      vers: 'lieux-activite',
    },
    { de: 'verifier-informations', vers: 'recapitulatif' },
    { de: 'lieux-activite', vers: 'recapitulatif' },
  ],
}

const departDataspace = ({
  profil,
  hasLieuxActivite,
}: InscriptionContexte): ValeurDEtapeDInscription => {
  if (profil === 'ConseillerNumerique')
    return hasLieuxActivite ? 'recapitulatif' : 'verifier-informations'
  return profil === 'CoordinateurConseillerNumerique'
    ? 'recapitulatif'
    : 'choisir-role'
}

/** Parcours raccourci du flow Dataspace pour un conseiller numérique. */
const fluxDataspace: Parcours = {
  depart: departDataspace,
  transitions: [{ de: 'lieux-activite', vers: 'recapitulatif' }],
}

const parcoursDuContexte = (contexte: InscriptionContexte): Parcours =>
  contexte.flowType === 'withoutDataspace' || !contexte.isConseillerNumerique
    ? fluxStandard
    : fluxDataspace

/** Détermine le type de flow selon la présence de données Dataspace. */
export const parcoursDInscription = ({
  hasDataspaceData,
}: {
  readonly hasDataspaceData: boolean
}): TypeDeParcours =>
  TypeDeParcours(hasDataspaceData ? 'withDataspace' : 'withoutDataspace')

/**
 * Étape suivante du parcours, ou `null` si terminale. Le flow sans Dataspace (ou
 * pour un non-conseiller numérique) suit le parcours complet ; le flow Dataspace
 * raccourcit selon le profil et la présence de lieux déjà connus.
 */
export const etapeSuivante = (
  courant: EtapeDInscription,
  contexte: InscriptionContexte,
): EtapeDInscription | null =>
  premiereTransition(
    parcoursDuContexte(contexte).transitions,
    courant,
    contexte,
  )

export const premiereEtape = (
  contexte: InscriptionContexte,
): EtapeDInscription =>
  EtapeDInscription(parcoursDuContexte(contexte).depart(contexte))
