/**
 * Vue domaine des données Dataspace pertinentes pour l'initialisation : on ne
 * retient que ce qui pilote le parcours (le statut conseiller numérique). Le
 * payload externe complet ne franchit pas la frontière du domaine (ACL).
 */
export type DataspaceInscription = {
  readonly isConseillerNumerique: boolean
}
