'use client'

import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { createSearchCallback } from './createSearchCallback'
import styles from './DataSearchBar.module.css'
import type {
  DataTableConfiguration,
  DataTableRow,
  DataTableSearchParams,
} from './DataTableConfiguration'

const DataSearchBar = <
  Data extends DataTableRow,
  Configuration extends DataTableConfiguration<Data>,
>({
  searchParams,
  baseHref,
  className,
  placeholder,
}: {
  searchParams: DataTableSearchParams<Configuration>
  baseHref: string
  className?: string
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
      className={classNames(className, styles.searchBar)}
      onButtonClick={onSearch}
      allowEmptySearch
      ref={searchBarRef}
      label={placeholder}
      big
    />
  )
}

export default DataSearchBar
