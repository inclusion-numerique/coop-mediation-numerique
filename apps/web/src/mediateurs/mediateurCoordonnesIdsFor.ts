type Coordination = { mediateurId: string }

type UserCoordinateur = {
  coordinateur?: {
    mediateursCoordonnes: Coordination[]
    ancienMediateursCoordonnes: Coordination[]
  } | null
}

const toMediateurId = ({ mediateurId }: Coordination) => mediateurId

export const mediateurCoordonnesIdsFor = (user: {
  coordinateur?: { mediateursCoordonnes: Coordination[] } | null
}) => (user.coordinateur?.mediateursCoordonnes ?? []).map(toMediateurId)

/**
 * Périmètre des statistiques d'un coordinateur : les membres actuels de l'équipe et les anciens,
 * ces derniers n'étant comptés que sur leur période d'appartenance (voir
 * `activitesEquipeCoordonneeWhereCondition`). Un médiateur ré-invité apparaît dans les deux listes,
 * d'où la déduplication.
 */
export const mediateurCoordonnesEtAnciensIdsFor = (user: UserCoordinateur) => [
  ...new Set([
    ...mediateurCoordonnesIdsFor(user),
    ...(user.coordinateur?.ancienMediateursCoordonnes ?? []).map(toMediateurId),
  ]),
]
