type ActifsDeLaCategorie = {
  readonly value: number
  readonly total: number
  readonly percentage: number
}

type UtilisateursActifs = {
  readonly total: number
  readonly mediateurs: ActifsDeLaCategorie
  readonly conseillers: ActifsDeLaCategorie
  readonly coordinateurs: ActifsDeLaCategorie
}

type UtilisateursActifsDuMois = {
  readonly mois: string
  readonly mediateursActifs: number
  readonly conseillersActifs: number
  readonly coordinateursActifs: number
}

export const utilisateursActifsPresentes = ({
  actifs: { total, mediateurs, conseillers, coordinateurs },
  parMois,
}: {
  readonly actifs: UtilisateursActifs
  readonly parMois: UtilisateursActifsDuMois[]
}) => ({
  total,
  series: [
    {
      label: 'Médiateurs numériques actifs',
      description: `sur ${mediateurs.total} profils de médiateurs numériques créés`,
      key: 'mediateursActifs',
      ...mediateurs,
    },
    {
      label: 'Conseillers numériques actifs',
      description: `sur ${conseillers.total} profils de conseillers numériques créés`,
      key: 'conseillersActifs',
      ...conseillers,
    },
    {
      label: 'Coordinateurs actifs',
      description: `sur ${coordinateurs.total} profils de coordinateurs créés`,
      key: 'coordinateursActifs',
      ...coordinateurs,
    },
  ],
  perMonth: parMois,
})
