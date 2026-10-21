import type { RoleMembre } from '../domain'

export const libelleDuRole = (role: RoleMembre | null): string =>
  role === 'ConseillerNumerique'
    ? 'Conseiller numérique'
    : 'Médiateur numérique'
