import { pluriel } from '@/libraries/pluriel'
import type { CriteresDesLieux } from '../../domain/index'

export const libelleDesResultats = (total: number, filtre: boolean): string =>
  total > 0
    ? `${total} ${pluriel(total, 'lieu', 'lieux')}`
    : filtre
      ? 'Aucun lieu ne correspond à votre recherche'
      : 'Aucun lieu référencé'

export const parametresDeLURL = ({
  recherche,
  communes,
  tri,
  page,
  lignes,
}: CriteresDesLieux) => ({
  recherche: recherche ?? undefined,
  communes: communes.length === 0 ? undefined : communes.join(','),
  tri,
  page: String(page),
  lignes: String(lignes),
})
