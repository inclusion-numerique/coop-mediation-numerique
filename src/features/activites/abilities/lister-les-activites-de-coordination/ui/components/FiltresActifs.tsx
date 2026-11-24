'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { useRouter, useSearchParams } from 'next/navigation'
import { requeteAvec, requeteConservant } from '@/libraries/parametres-d-url'
import type { FiltreActif } from '../../../../ui/presenters/filtres-actifs-des-coordinations.presenter'
import { sansLaValeurDesFiltres } from '../search-params/filtres-des-coordinations.search-params'

export const FiltresActifs = ({
  ignoreParams = [],
  filters,
}: {
  ignoreParams?: string[]
  filters: readonly FiltreActif[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleRemoveFilter = (
    filterParams: readonly string[],
    value?: string,
  ) =>
    router.replace(
      requeteAvec(
        searchParams,
        sansLaValeurDesFiltres(searchParams, filterParams, value),
      ),
      { scroll: false },
    )

  const handleClearFilters = () =>
    router.replace(requeteConservant(searchParams, ignoreParams), {
      scroll: false,
    })

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
