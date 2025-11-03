'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { useRouter, useSearchParams } from 'next/navigation'

const queryParamsToKeep = ['page', 'lignes']

export const CoordinationFilterTags = ({
  filters,
}: {
  filters: {
    types: string[]
  }
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const filterLabelsToDisplay: {
    type: string
    key: string
    label: string
  }[] = []

  if (filters.types && filters.types.length > 0) {
    for (const type of filters.types) {
      filterLabelsToDisplay.push({
        type: 'types',
        key: type,
        label: type,
      })
    }
  }

  const handleRemoveFilter = (key: string, value: string) => {
    const current = params.get(key)?.split(',').filter(Boolean) ?? []
    const updated = current.filter((v) => v !== value)

    if (updated.length > 0) {
      params.set(key, updated.join(','))
    } else {
      params.delete(key)
    }

    router.replace(`?${params}`, { scroll: false })
  }

  const handleClearFilters = () => {
    const newQueryParams = new URLSearchParams()
    for (const paramToKeep of queryParamsToKeep) {
      if (searchParams.has(paramToKeep)) {
        newQueryParams.set(paramToKeep, searchParams.get(paramToKeep) ?? '')
      }
    }
    router.replace(`?${newQueryParams.toString()}`, { scroll: false })
  }

  return filterLabelsToDisplay.length > 0 ? (
    <>
      <hr className="fr-separator-1px" />
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-my-4v fr-flex-gap-4v">
        <ul className="fr-flex fr-flex-wrap fr-flex-gap-2v fr-list-group">
          {filterLabelsToDisplay.map((filter) => (
            <li
              className="fr-line-height-1 fr-p-0"
              key={`${filter.type}-${filter.key}`}
            >
              <Tag
                className="fr-pr-3v"
                small
                nativeButtonProps={{
                  type: 'button',
                  onClick: () => handleRemoveFilter(filter.type, filter.key),
                }}
              >
                <span className="fr-icon-close-line fr-icon--xs" />
                &nbsp;{filter.label}
              </Tag>
            </li>
          ))}
        </ul>
        <div>
          <Button priority="tertiary no outline" onClick={handleClearFilters}>
            <span className="ri-close-circle-line" aria-hidden />
            &nbsp;Effacer&nbsp;les&nbsp;filtres
          </Button>
        </div>
      </div>
      <hr className="fr-separator-1px" />
    </>
  ) : (
    <hr className="fr-separator-1px" />
  )
}
