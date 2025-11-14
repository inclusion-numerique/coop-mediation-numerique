'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from 'next/navigation'

type Filter = {
  params: string[]
  label: string
  value?: string
}

const removeValue = (valueToRemove: string) => (value: string) =>
  value !== valueToRemove

const removeValueFromParam = (key: string) => (updatedValues: string[]) => ({
  key,
  value: updatedValues.length > 0 ? updatedValues.join(',') : undefined,
})

const toParamUpdate =
  (searchParams: ReadonlyURLSearchParams) =>
  (value?: string) =>
  (key: string) =>
    value == null
      ? { key, value: undefined }
      : removeValueFromParam(key)(
          searchParams.get(key)?.split(',').filter(removeValue(value)) ?? [],
        )

const applyParamUpdate = (
  acc: URLSearchParams,
  { key, value }: { key: string; value?: string },
): URLSearchParams => {
  const next = new URLSearchParams(acc.toString())
  value != null ? next.set(key, value) : next.delete(key)
  return next
}

const toPreservedParams =
  (searchParams: ReadonlyURLSearchParams) => (keys: string[]) =>
    new URLSearchParams(
      keys
        .filter((key) => searchParams.has(key))
        .map((key) => [key, searchParams.get(key) ?? '']),
    )

export const CoordinationFilterTags = ({
  ignoreParams = [],
  filters,
}: {
  ignoreParams?: string[]
  filters: Filter[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleRemoveFilter = (filterParams: string[], value?: string) => {
    const params = filterParams
      .map(toParamUpdate(searchParams)(value))
      .reduce(applyParamUpdate, new URLSearchParams(searchParams.toString()))
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleClearFilters = () => {
    const params = toPreservedParams(searchParams)(ignoreParams)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return filters.length > 0 ? (
    <>
      <hr className="fr-separator-1px" />
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-my-4v fr-flex-gap-4v">
        <ul className="fr-flex fr-flex-wrap fr-flex-gap-2v fr-list-group">
          {filters.map((filter) => (
            <li
              className="fr-line-height-1 fr-p-0"
              key={`${filter.params.join('-')}-${filter.label}`}
            >
              <Tag
                className="fr-pr-3v"
                small
                nativeButtonProps={{
                  type: 'button',
                  onClick: () =>
                    handleRemoveFilter(filter.params, filter.value),
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
