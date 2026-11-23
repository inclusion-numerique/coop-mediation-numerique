import type { FiltresUtilisateurs } from '@/features/utilisateurs/domain'

type ValeurDeLieu = {
  type: 'lieu' | 'commune' | 'departement'
  value: string[]
}

export const valeursDeLieu = (filtres: FiltresUtilisateurs): ValeurDeLieu[] => [
  ...(filtres.lieux.length === 0
    ? []
    : [{ type: 'lieu' as const, value: [...filtres.lieux] }]),
  ...(filtres.communes.length === 0
    ? []
    : [{ type: 'commune' as const, value: [...filtres.communes] }]),
  ...(filtres.departements.length === 0
    ? []
    : [{ type: 'departement' as const, value: [...filtres.departements] }]),
]
