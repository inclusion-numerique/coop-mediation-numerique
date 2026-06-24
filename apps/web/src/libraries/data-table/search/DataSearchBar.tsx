'use client'

import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { DataTableUrlState } from '../data-table-url-state'
import { createSearchCallback } from './create-search-callback'

export type DataSearchBarProps = {
  state: DataTableUrlState
  baseHref: string
  className?: string
  placeholder?: string
}

export const DataSearchBar = ({
  state,
  baseHref,
  className,
  placeholder,
}: DataSearchBarProps) => {
  const router = useRouter()

  const onSearch = createSearchCallback({ router, state, baseHref })

  const searchBarRef = useRef<HTMLDivElement>(null)

  // Initialise la valeur de l'input au premier rendu uniquement.
  // biome-ignore lint/correctness/useExhaustiveDependencies: first render only, ui stays in sync afterwards
  useEffect(() => {
    if (!state.recherche) return
    const input = searchBarRef.current?.querySelector('input')
    if (input) input.value = state.recherche
  }, [])

  return (
    <SearchBar
      className={classNames(className, 'fr-search-bar--inline')}
      onButtonClick={onSearch}
      allowEmptySearch
      ref={searchBarRef}
      label={placeholder}
      big
    />
  )
}
