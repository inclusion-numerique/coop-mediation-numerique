'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ActivitesFilters } from '../validation/ActivitesFilters'
import {
  generateActivitesFiltersLabels,
  toLieuPrefix,
} from './generateActivitesFiltersLabels'

export const FilterTags = ({
  filters,
  lieuxActiviteOptions,
  mediateursOptions,
  beneficiairesOptions,
  departementsOptions,
  communesOptions,
}: {
  filters: ActivitesFilters
  mediateursOptions: MediateurOption[]
  beneficiairesOptions: BeneficiaireOption[]
  lieuxActiviteOptions: LieuActiviteOption[]
  departementsOptions: SelectOption[]
  communesOptions: SelectOption[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const filterLabelsToDisplay = generateActivitesFiltersLabels(filters, {
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
    beneficiairesOptions,
    mediateursOptions,
  }).map(toLieuPrefix)

  const handleRemoveFilter = (key: string, value: string | string[]) => {
    if (Array.isArray(value)) {
      for (const param of value) params.delete(param)
      return router.replace(`?${params}`, { scroll: false })
    }

    const updatedValues = (params.get(key)?.split(',') ?? []).filter(
      (v) => v !== value,
    )

    if (updatedValues.length > 0) {
      params.set(key, updatedValues.join(','))
    } else {
      params.delete(key)
    }

    router.replace(`?${params}`, { scroll: false })
  }

  const handleClearFilters = () => {
    router.replace('?', { scroll: false })
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
                  onClick: () =>
                    handleRemoveFilter(filter.type, filter.key ?? []),
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
