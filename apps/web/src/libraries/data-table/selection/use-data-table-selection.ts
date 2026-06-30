'use client'

import { useCallback, useState } from 'react'

export type DataTableSelection = {
  readonly selectedIds: Set<string>
  readonly allSelected: boolean
  readonly someSelected: boolean
  readonly toggle: (id: string) => void
  readonly toggleAll: () => void
  readonly clear: () => void
}

/**
 * État de sélection multi-lignes, headless. `allIds` est l'ensemble des
 * identifiants sélectionnables affichés (typiquement la page courante).
 */
export const useDataTableSelection = (
  allIds: readonly string[],
): DataTableSelection => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.has(id))
  const someSelected = allIds.some((id) => selectedIds.has(id))

  const toggle = useCallback(
    (id: string) =>
      setSelectedIds((current) => {
        const ids = [...current]
        return new Set(
          ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
        )
      }),
    [],
  )

  const toggleAll = useCallback(
    () => setSelectedIds(allSelected ? new Set() : new Set(allIds)),
    [allSelected, allIds],
  )

  const clear = useCallback(() => setSelectedIds(new Set()), [])

  return { selectedIds, allSelected, someSelected, toggle, toggleAll, clear }
}
