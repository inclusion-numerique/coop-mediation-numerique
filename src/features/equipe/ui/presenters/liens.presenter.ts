export const hrefDeLEquipe = (coordinateurId: string) =>
  `/coop/mes-equipes/${coordinateurId}` as const

export const hrefDeLExportDeLEquipe = (coordinateurId: string) =>
  `${hrefDeLEquipe(coordinateurId)}/export` as const

export const hrefDuCoordinateurEnAdministration = (utilisateurId: string) =>
  `/administration/utilisateurs/${utilisateurId}` as const

export const hrefDeLEquipeDuCoordinateurEnAdministration = (
  utilisateurId: string,
) => `/administration/utilisateurs/${utilisateurId}#coordinateur` as const

export const hrefDeConnexion = (suivant: string) =>
  `/connexion?suivant=${encodeURIComponent(suivant)}` as const
