export const hrefDeLEquipe = (coordinateurId: string) =>
  `/coop/mes-equipes/${coordinateurId}` as const

export const hrefDesStatistiquesDeLaPeriode = (du: string, au: string) =>
  `/coop/mes-statistiques?du=${du}&au=${au}` as const
