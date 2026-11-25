import {
  CoordinateurId,
  CoordinateurId as CoordinateurIdDesActivites,
  MediateurId,
  MediateurId as MediateurIdDesActivites,
  type PerimetreDesActivites,
  type PerimetreDesStatistiques,
  perimetreDuDemandeur,
} from '@/features/activites/domain'

type Coordination = { readonly mediateurId: string }

type Demandeur = {
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: {
    readonly id: string
    readonly mediateursCoordonnes: readonly Coordination[]
    readonly ancienMediateursCoordonnes: readonly Coordination[]
  } | null
}

const membresEtAnciensMembres = ({ coordinateur }: Demandeur): string[] => [
  ...new Set(
    [
      ...(coordinateur?.mediateursCoordonnes ?? []),
      ...(coordinateur?.ancienMediateursCoordonnes ?? []),
    ].map(({ mediateurId }) => mediateurId),
  ),
]

export const perimetreDeLUtilisateur = (
  user: Demandeur,
): PerimetreDesStatistiques | null =>
  perimetreDuDemandeur({
    mediateur: user.mediateur ? MediateurId(user.mediateur.id) : null,
    coordinateur: user.coordinateur
      ? CoordinateurId(user.coordinateur.id)
      : null,
    equipe: membresEtAnciensMembres(user).map((id) => MediateurId(id)),
  })

export const perimetreDesEmployeusesDe = (
  user: Demandeur,
): PerimetreDesActivites => ({
  mediateurs: [
    ...(user.mediateur?.id ? [user.mediateur.id] : []),
    ...membresEtAnciensMembres(user),
  ].map((id) => MediateurIdDesActivites(id)),
  coordinateurId: user.coordinateur?.id
    ? CoordinateurIdDesActivites(user.coordinateur.id)
    : null,
})
