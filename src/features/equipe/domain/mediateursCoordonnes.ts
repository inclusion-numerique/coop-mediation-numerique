type Coordination = { mediateurId: string }

type UserCoordinateur = {
  coordinateur?: {
    mediateursCoordonnes: Coordination[]
    ancienMediateursCoordonnes: Coordination[]
  } | null
}

const idDuMediateur = ({ mediateurId }: Coordination) => mediateurId

export const mediateurCoordonnesIdsFor = (user: {
  coordinateur?: { mediateursCoordonnes: Coordination[] } | null
}) => (user.coordinateur?.mediateursCoordonnes ?? []).map(idDuMediateur)

export const mediateurCoordonnesEtAnciensIdsFor = (user: UserCoordinateur) => [
  ...new Set([
    ...mediateurCoordonnesIdsFor(user),
    ...(user.coordinateur?.ancienMediateursCoordonnes ?? []).map(idDuMediateur),
  ]),
]
