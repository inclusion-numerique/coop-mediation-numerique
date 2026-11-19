import { CoordinateurId, type Gestionnaire } from '../../domain'

export const gestionnaireDe = (user: {
  readonly role: string
  readonly coordinateur: { readonly id: string } | null
}): Gestionnaire => {
  if (user.role === 'Admin') return { type: 'Administrateur' }
  if (user.coordinateur != null)
    return {
      type: 'Coordinateur',
      coordinateurId: CoordinateurId(user.coordinateur.id),
    }
  return { type: 'Autre' }
}
