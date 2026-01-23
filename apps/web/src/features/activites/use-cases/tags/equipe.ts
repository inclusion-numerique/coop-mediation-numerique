import { SessionUser } from '@app/web/auth/sessionUser'

export type Equipe = {
  id: string
  nom: string
}

const coordinateurEquipe = (user: SessionUser): Equipe[] =>
  user.coordinateur
    ? [{ id: user.coordinateur.id, nom: user.name ?? 'Mon équipe' }]
    : []

const mediateurEquipes = (user: SessionUser): Equipe[] =>
  user.mediateur?.coordinations.map(({ coordinateur }) => ({
    id: coordinateur.id,
    nom: coordinateur.user.name ?? 'Équipe',
  })) ?? []

const uniqueById = (equipes: Equipe[]): Equipe[] =>
  equipes.filter(
    (equipe, index, all) => all.findIndex((e) => e.id === equipe.id) === index,
  )

export const getEquipesFromSessionUser = (user: SessionUser): Equipe[] =>
  uniqueById([...coordinateurEquipe(user), ...mediateurEquipes(user)])

export const getEquipeCoordinateurIds = (equipes: Equipe[]): string[] =>
  equipes.map((e) => e.id)

export const getEquipeInfo = (
  equipes: Equipe[],
  coordinateurId: string | null,
  isEquipe: boolean | null,
) => {
  if (!isEquipe || coordinateurId == null || equipes.length <= 1)
    return undefined

  const index = equipes.findIndex((e) => e.id === coordinateurId)

  return index < 0
    ? undefined
    : {
        equipeNumber: index + 1,
        equipeCoordinateurNom: equipes[index].nom ?? undefined,
      }
}
