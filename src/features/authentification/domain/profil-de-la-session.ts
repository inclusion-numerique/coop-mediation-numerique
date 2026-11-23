import { getUserDepartement } from '@/libraries/departement/getUserDepartement'
import type { SessionUser } from './sessionUser'

export type ProfilDeLaSession = {
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
  readonly equipes: readonly {
    readonly coordinateurId: string
    readonly nom: string | null
  }[]
  readonly departement: string | null
}

const equipesDe = (user: SessionUser): ProfilDeLaSession['equipes'] => [
  ...(user.coordinateur === null
    ? []
    : [{ coordinateurId: user.coordinateur.id, nom: user.name }]),
  ...(user.mediateur?.coordinations.map(({ coordinateur }) => ({
    coordinateurId: coordinateur.id,
    nom: coordinateur.user.name,
  })) ?? []),
]

export const profilDeLaSession = (user: SessionUser): ProfilDeLaSession => ({
  mediateurId: user.mediateur?.id ?? null,
  coordinateurId: user.coordinateur?.id ?? null,
  equipes: equipesDe(user),
  departement: getUserDepartement(user)?.code ?? null,
})
