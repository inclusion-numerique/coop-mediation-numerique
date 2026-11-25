const CHEMIN = '/administration/utilisateurs/export'

export const lienDExport = (requete: string): string =>
  requete === '' ? CHEMIN : `${CHEMIN}?${requete}`
