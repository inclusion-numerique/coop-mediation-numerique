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

export type MesureDesUtilisateursActifs = {
  readonly mesurerLesUtilisateursActifs: (
    maintenant: Date,
  ) => Promise<UtilisateursActifs>
  readonly utilisateursActifsParMois: () => Promise<UtilisateursActifsDuMois[]>
}
