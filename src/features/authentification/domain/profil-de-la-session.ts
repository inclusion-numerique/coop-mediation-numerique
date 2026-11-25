import { getUserDepartement } from '@/libraries/departement'
import type { UtilisateurDeLaSession } from './utilisateur-de-la-session'

export type ProfilDeLaSession = {
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
  readonly equipes: readonly {
    readonly coordinateurId: string
    readonly nom: string | null
  }[]
  readonly departement: string | null
}

const equipesDe = (
  user: UtilisateurDeLaSession,
): ProfilDeLaSession['equipes'] => [
  ...(user.coordinateur === null
    ? []
    : [{ coordinateurId: user.coordinateur.id, nom: user.name }]),
  ...(user.mediateur?.coordinations.map(({ coordinateur }) => ({
    coordinateurId: coordinateur.id,
    nom: coordinateur.user.name,
  })) ?? []),
]

export const profilDeLaSession = (
  user: UtilisateurDeLaSession,
): ProfilDeLaSession => ({
  mediateurId: user.mediateur?.id ?? null,
  coordinateurId: user.coordinateur?.id ?? null,
  equipes: equipesDe(user),
  departement: getUserDepartement(user)?.code ?? null,
})
