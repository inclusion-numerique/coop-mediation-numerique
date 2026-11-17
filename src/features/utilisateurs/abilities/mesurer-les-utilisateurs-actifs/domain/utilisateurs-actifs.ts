export const categoriesStatistiques = [
  'mediateurs',
  'conseillers',
  'coordinateurs',
] as const

export type CategorieStatistique = (typeof categoriesStatistiques)[number]

export type ActifsDeLaCategorie = {
  readonly value: number
  readonly total: number
  readonly percentage: number
}

export type UtilisateursActifs = {
  readonly total: number
} & Readonly<Record<CategorieStatistique, ActifsDeLaCategorie>>

export const actifsDeLaCategorie = ({
  actifs,
  total,
}: {
  readonly actifs: number
  readonly total: number
}): ActifsDeLaCategorie => ({
  value: actifs,
  total,
  percentage: total > 0 ? Math.round((actifs / total) * 100) : 0,
})

export const utilisateursActifs = (
  categories: Readonly<Record<CategorieStatistique, ActifsDeLaCategorie>>,
): UtilisateursActifs => ({
  ...categories,
  total: categoriesStatistiques.reduce(
    (somme, categorie) => somme + categories[categorie].value,
    0,
  ),
})
