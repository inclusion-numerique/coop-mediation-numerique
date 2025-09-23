export enum TagScope {
  Personnel = 'personnel',
  Departemental = 'départemental',
  National = 'national',
}

export const getTagScope = (tag: {
  mediateurId: string | null
  departement: string | null
}) => {
  if (tag.mediateurId) return TagScope.Personnel
  if (tag.departement) return TagScope.Departemental
  return TagScope.National
}
