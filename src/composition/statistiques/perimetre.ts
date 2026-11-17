import { mediateurCoordonnesEtAnciensIdsFor } from '@app/web/auth/mediateursCoordonnes'
import type { SessionUser } from '@app/web/auth/sessionUser'
import {
  CoordinateurId as CoordinateurIdDesActivites,
  MediateurId as MediateurIdDesActivites,
  type PerimetreDesActivites,
} from '@app/web/features/activites/abilities/rechercher-les-employeuses-des-activites'
import {
  CoordinateurId,
  MediateurId,
  type PerimetreDesStatistiques,
  perimetreDuDemandeur,
} from '@app/web/features/activites/domain'

export const perimetreDeLUtilisateur = (
  user: SessionUser,
): PerimetreDesStatistiques | null =>
  perimetreDuDemandeur({
    mediateur: user.mediateur ? MediateurId(user.mediateur.id) : null,
    coordinateur: user.coordinateur
      ? CoordinateurId(user.coordinateur.id)
      : null,
    equipe: mediateurCoordonnesEtAnciensIdsFor(user).map((id) =>
      MediateurId(id),
    ),
  })

export const perimetreDesEmployeusesDe = (
  user: SessionUser,
): PerimetreDesActivites => ({
  mediateurs: [
    ...(user.mediateur?.id ? [user.mediateur.id] : []),
    ...mediateurCoordonnesEtAnciensIdsFor(user),
  ].map((id) => MediateurIdDesActivites(id)),
  coordinateurId: user.coordinateur?.id
    ? CoordinateurIdDesActivites(user.coordinateur.id)
    : null,
})
