type Coordination = { readonly mediateurId: string }

type UserCoordinateur = {
  readonly coordinateur?: {
    readonly mediateursCoordonnes: readonly Coordination[]
    readonly ancienMediateursCoordonnes: readonly Coordination[]
  } | null
}

const idDuMediateur = ({ mediateurId }: Coordination) => mediateurId

export const mediateurCoordonnesIdsFor = (user: {
  readonly coordinateur?: {
    readonly mediateursCoordonnes: readonly Coordination[]
  } | null
}) => (user.coordinateur?.mediateursCoordonnes ?? []).map(idDuMediateur)

export const mediateurCoordonnesEtAnciensIdsFor = (user: UserCoordinateur) => [
  ...new Set([
    ...mediateurCoordonnesIdsFor(user),
    ...(user.coordinateur?.ancienMediateursCoordonnes ?? []).map(idDuMediateur),
  ]),
]
