import { ProfilInscription } from './profil-inscription'

/**
 * Ce que le dispositif dit d'une personne. `connue` remplace le « trouvé / pas
 * trouvé dans l'API Dataspace » qui pilotait les deux branches de l'inscription.
 *
 * ⚠ La lecture qui alimente ce type teste l'existence d'une `main.personne`
 * portant le `coop_id` — soit « connue de l'entrepôt », pas « connue du
 * dispositif ». Voir `refactor/13-profil-prerempli-sans-role.md`.
 */
export type DispositifPersonne = {
  readonly connue: boolean
  readonly estConseillerNumerique: boolean
  readonly estCoordinateur: boolean
}

export const dispositifInconnu: DispositifPersonne = {
  connue: false,
  estConseillerNumerique: false,
  estCoordinateur: false,
}

/**
 * Profil d'inscription déduit du dispositif — même table de décision que du
 * temps de l'API, sur des valeurs dérivées plutôt que recopiées. `null` quand le
 * dispositif ne connaît pas la personne : c'est alors le parcours déclaratif qui
 * choisit le rôle. Règle pure, sœur de `computeUserProfile`.
 */
export const profilDepuisDispositif = ({
  connue,
  estConseillerNumerique,
  estCoordinateur,
}: DispositifPersonne): ProfilInscription | null => {
  if (!connue) return null
  if (estCoordinateur && estConseillerNumerique)
    return ProfilInscription('CoordinateurConseillerNumerique')
  if (estCoordinateur) return ProfilInscription('Coordinateur')
  if (estConseillerNumerique) return ProfilInscription('ConseillerNumerique')
  return ProfilInscription('Mediateur')
}
