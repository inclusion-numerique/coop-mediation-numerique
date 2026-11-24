export const hrefDuReseau = (departement: string) =>
  `/coop/mon-reseau/${departement}` as const

export const hrefDesActeurs = (departement: string) =>
  `${hrefDuReseau(departement)}/acteurs` as const

export const hrefDesLieux = (departement: string) =>
  `${hrefDuReseau(departement)}/lieux` as const

export const hrefDeLActeur = (
  departement: string,
  acteurId: string,
  ancre?: string,
) =>
  `${hrefDesActeurs(departement)}/${acteurId}${ancre === undefined ? '' : (`#${ancre}` as const)}` as const

export const hrefDesStatistiquesDuMediateur = (mediateurId: string) =>
  `/coop/mes-statistiques?mediateurs=${mediateurId}` as const
