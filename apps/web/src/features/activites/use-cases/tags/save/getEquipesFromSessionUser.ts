import { SessionUser } from '@app/web/auth/sessionUser'
import { Equipe } from './SaveTagModal'

export const getEquipesFromSessionUser = (user: SessionUser): Equipe[] => {
  const equipes: Equipe[] = []

  if (user.coordinateur != null) {
    equipes.push({
      id: user.coordinateur.id,
      nom: user.name ?? 'Mon équipe',
    })
  }

  if (user.mediateur != null) {
    for (const coordination of user.mediateur.coordinations) {
      if (!equipes.some((e) => e.id === coordination.coordinateur.id)) {
        equipes.push({
          id: coordination.coordinateur.id,
          nom: coordination.coordinateur.user.name ?? 'Équipe',
        })
      }
    }
  }

  return equipes
}
