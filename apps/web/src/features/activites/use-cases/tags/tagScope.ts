export enum TagScope {
  Personnel = 'personnel',
  Departemental = 'départemental',
  National = 'national',
}

export const getTagScope = (tag: {
  mediateurId: string | null
  coordinateurId: string | null
  departement: string | null
}) => {
  if (tag.mediateurId || tag.coordinateurId) return TagScope.Personnel
  if (tag.departement) return TagScope.Departemental
  return TagScope.National
}
