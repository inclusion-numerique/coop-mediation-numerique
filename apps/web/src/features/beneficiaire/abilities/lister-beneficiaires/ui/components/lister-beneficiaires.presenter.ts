import type { BeneficiaireListItem } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/domain/lister-beneficiaires'
import type { Paginated } from '@arckit/resultset'
import { type BeneficiaireRow, toBeneficiaireRow } from './beneficiaire-row'

export type BeneficiairesPaginationView = {
  readonly currentPage: number
  readonly pageSize: number
  readonly totalItems: number
  readonly totalPages: number
  readonly hasMultiplePages: boolean
}

/**
 * ViewModel de la liste, sous forme d'union discriminée : la page se contente
 * de filtrer sur `tag`, sans logique.
 */
export type MesBeneficiairesView =
  | { readonly tag: 'empty' }
  | { readonly tag: 'noResults'; readonly recherche: string }
  | {
      readonly tag: 'results'
      readonly rows: readonly BeneficiaireRow[]
      readonly pagination: BeneficiairesPaginationView
    }

export const presentMesBeneficiaires = (
  result: Paginated<BeneficiaireListItem>,
  recherche?: string,
): MesBeneficiairesView => {
  if (result.totalItems === 0)
    return recherche ? { tag: 'noResults', recherche } : { tag: 'empty' }

  const totalPages = Math.max(1, Math.ceil(result.totalItems / result.pageSize))

  return {
    tag: 'results',
    rows: result.items.map(toBeneficiaireRow),
    pagination: {
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      totalItems: result.totalItems,
      totalPages,
      hasMultiplePages: totalPages > 1,
    },
  }
}
