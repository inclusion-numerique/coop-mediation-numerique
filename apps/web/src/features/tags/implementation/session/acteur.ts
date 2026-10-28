import { getUserDepartement } from '@app/web/auth/getUserDepartement'
import type { SessionUser } from '@app/web/auth/sessionUser'
import { CodeDepartement } from '@app/web/libraries/departement'
import {
  type Acteur,
  CoordinateurId,
  type Equipe,
  MediateurId,
  NomDuCoordinateur,
} from '../../domain'

const equipe = (coordinateurId: string, nom: string | null): Equipe => ({
  coordinateurId: CoordinateurId(coordinateurId),
  coordonneePar: NomDuCoordinateur.safe(nom ?? ''),
})

const equipesDe = (user: SessionUser): readonly Equipe[] => {
  const equipes = [
    ...(user.coordinateur == null
      ? []
      : [equipe(user.coordinateur.id, user.name)]),
    ...(user.mediateur?.coordinations.map(({ coordinateur }) =>
      equipe(coordinateur.id, coordinateur.user.name),
    ) ?? []),
  ]

  return equipes.filter(
    ({ coordinateurId }, index) =>
      equipes.findIndex((autre) => autre.coordinateurId === coordinateurId) ===
      index,
  )
}

export const acteurDe = (user: SessionUser): Acteur => ({
  mediateurId: user.mediateur == null ? null : MediateurId(user.mediateur.id),
  coordinateurId:
    user.coordinateur == null ? null : CoordinateurId(user.coordinateur.id),
  equipes: equipesDe(user),
  departement: CodeDepartement.safe(getUserDepartement(user)?.code ?? ''),
})
