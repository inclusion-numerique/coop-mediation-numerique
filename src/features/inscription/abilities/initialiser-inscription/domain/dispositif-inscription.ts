/**
 * Vue domaine de ce que le dispositif dit d'une personne. On n'en retient que ce
 * qui pilote le parcours : être connu, et l'être comme conseiller numérique.
 *
 * `connue` remplace le « trouvé / pas trouvé » de l'API Dataspace : une personne
 * absente de `main` est une personne que le dispositif ne connaît pas, ce que le
 * 404 de l'API signifiait auparavant. Le reste du dispositif (coordinateur,
 * affectations) ne franchit pas la frontière du domaine (ACL).
 */
export type DispositifInscription = {
  readonly connue: boolean
  readonly estConseillerNumerique: boolean
}
