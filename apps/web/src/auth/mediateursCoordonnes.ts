type MediateurCoordonne = {
  mediateurId: string
  suppression: Date | null
}

type Coordinateur = {
  mediateursCoordonnes: MediateurCoordonne[]
}

const toMediateurId = ({ mediateurId }: MediateurCoordonne) => ({
  mediateurId,
})

const isCurrent = ({ suppression }: MediateurCoordonne) => suppression == null

const isAncien = ({ suppression }: MediateurCoordonne) => suppression != null

export const splitMediateursCoordonnes = <T extends Coordinateur>(
  coordinateur: T | null,
) => {
  if (!coordinateur) return null

  const { mediateursCoordonnes, ...rest } = coordinateur

  return {
    ...rest,
    mediateursCoordonnes: mediateursCoordonnes
      .filter(isCurrent)
      .map(toMediateurId),
    ancienMediateursCoordonnes: mediateursCoordonnes
      .filter(isAncien)
      .map(toMediateurId),
  }
}

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
