export enum TagScope {
  Personnel = 'personnel',
  Equipe = 'd’équipe',
  Departemental = 'départemental',
  National = 'national',
}

export const getTagScope = (tag: {
  mediateurId: string | null
  coordinateurId: string | null
  departement: string | null
  equipe: boolean | null
}) => {
  if (tag.equipe === true) return TagScope.Equipe
  if (tag.mediateurId || tag.coordinateurId) return TagScope.Personnel
  if (tag.departement) return TagScope.Departemental
  return TagScope.National
}
