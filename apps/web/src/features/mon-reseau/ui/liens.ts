export const hrefDuReseau = (departement: string): string =>
  `/coop/mon-reseau/${departement}`

export const hrefDesActeurs = (departement: string): string =>
  `${hrefDuReseau(departement)}/acteurs`

export const hrefDesLieux = (departement: string): string =>
  `${hrefDuReseau(departement)}/lieux`

export const hrefDeLActeur = (
  departement: string,
  acteurId: string,
  ancre?: string,
): string =>
  `${hrefDesActeurs(departement)}/${acteurId}${ancre === undefined ? '' : `#${ancre}`}`
