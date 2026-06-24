/**
 * Liste des numéros de page à afficher (max 6 liens), avec des « séparateurs »
 * (chaînes uniques, utilisables comme `key`) pour les ellipses.
 */
export const createPagesNumbersToDisplay = (
  totalPages: number,
  pageNumber: number,
): (number | string)[] => {
  // Peu de pages : on les affiche toutes.
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }).map((_, index) => index + 1)
  }

  // Page en début ou fin de liste : une seule ellipse.
  if (pageNumber <= 3 || pageNumber >= totalPages - 2) {
    return [1, 2, 3, 'separator', totalPages - 2, totalPages - 1, totalPages]
  }

  // Page au milieu : encadrée par deux ellipses.
  return [
    1,
    'separator1',
    pageNumber - 1,
    pageNumber,
    pageNumber + 1,
    'separator2',
    totalPages,
  ]
}
