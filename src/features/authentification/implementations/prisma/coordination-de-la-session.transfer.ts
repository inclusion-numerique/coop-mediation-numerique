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
