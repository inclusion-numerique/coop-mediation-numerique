import type { SessionUser } from '@app/web/auth/sessionUser'
import { CoordinateurId, type Gestionnaire } from '../../domain'

export const gestionnaireDe = (user: SessionUser): Gestionnaire => {
  if (user.role === 'Admin') return { type: 'Administrateur' }
  if (user.coordinateur != null)
    return {
      type: 'Coordinateur',
      coordinateurId: CoordinateurId(user.coordinateur.id),
    }
  return { type: 'Autre' }
}
