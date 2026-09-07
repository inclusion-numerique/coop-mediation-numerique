/**
 * La règle de publication sur la cartographie nationale : un lieu visible
 * annonce au moins un service.
 *
 * Une fiche publiée sans rien à offrir n'apprend rien à qui la trouve, et
 * l'annuaire national n'a pas de raison de la porter. La règle vaut donc des
 * deux côtés — on ne crée pas un lieu visible sans service, et on ne rend pas
 * visible un lieu qui n'en a pas, pas plus qu'on ne retire le dernier service
 * d'un lieu visible.
 *
 * Elle est dite ici sur des valeurs nues plutôt que sur un `Lieu` : le
 * formulaire de création la mesure sur sa saisie, la modification sur le lieu
 * qu'elle vient de composer. Une seule règle, deux façons de la rencontrer.
 */
export const PUBLICATION_SANS_SERVICE =
  'Au moins un service doit être renseigné pour que le lieu d’activité soit visible sur la cartographie.'

export const publicationSansService = (
  publie: boolean,
  services: readonly unknown[] | null | undefined,
): boolean => publie && (services?.length ?? 0) === 0
