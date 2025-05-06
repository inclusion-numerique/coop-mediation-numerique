'use client'

import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type {
  DataTableConfiguration,
  DataTableRow,
  DataTableSearchParams,
} from './DataTableConfiguration'
import { createSearchCallback } from './createSearchCallback'

const DataSearchBar = <
  Data extends DataTableRow,
  Configuration extends DataTableConfiguration<Data>,
>({
  searchParams,
  baseHref,
  placeholder,
}: {
  searchParams: DataTableSearchParams<Configuration>
  baseHref: string
  placeholder?: string
}) => {
  const router = useRouter()

  const onSearch = createSearchCallback({
    searchParams,
    router,
    baseHref,
  })

  const searchBarRef = useRef<HTMLDivElement>(null)

  // Initialise input value
  // biome-ignore lint/correctness/useExhaustiveDependencies: this is only for the first render, ui will be updated correctly afterwards
  useEffect(() => {
    if (!searchParams.recherche) {
      return
    }
    const searchBarElement = searchBarRef.current
    if (!searchBarElement) return

    // Find the input element inside searchbar element , and set value to searchQuery

    const input = searchBarElement.querySelector('input')

    if (input) {
      input.value = searchParams.recherche
    }
  }, [])

  return (
    <SearchBar
      className="fr-flex-grow-1"
      onButtonClick={onSearch}
      allowEmptySearch
      ref={searchBarRef}
      label={placeholder}
      big
    />
  )
}

export default DataSearchBar
