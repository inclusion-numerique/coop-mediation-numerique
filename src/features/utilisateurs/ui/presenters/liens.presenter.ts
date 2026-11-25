export const hrefDeLUtilisateur = (id: string) =>
  `/administration/utilisateurs/${id}` as const

export const hrefDeLaFusion = (id: string) =>
  `${hrefDeLUtilisateur(id)}/merge` as const

export const hrefDuCompteAFusionner = (cibleId: string, id: string) =>
  `${hrefDeLaFusion(cibleId)}/${id}` as const

export const hrefDAjoutALEquipe = (id: string) =>
  `${hrefDeLUtilisateur(id)}/equipe-coordonnee/ajouter` as const
