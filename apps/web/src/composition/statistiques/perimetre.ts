import { mediateurCoordonnesEtAnciensIdsFor } from '@app/web/auth/mediateursCoordonnes'
import type { SessionUser } from '@app/web/auth/sessionUser'
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
