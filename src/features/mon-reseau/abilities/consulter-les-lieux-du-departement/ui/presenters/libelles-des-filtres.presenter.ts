import { pluriel } from '@/libraries/pluriel'

export const libelleDesResultats = (total: number, filtre: boolean): string =>
  total > 0
    ? `${total} ${pluriel(total, 'lieu', 'lieux')}`
    : filtre
      ? 'Aucun lieu ne correspond à votre recherche'
      : 'Aucun lieu référencé'
