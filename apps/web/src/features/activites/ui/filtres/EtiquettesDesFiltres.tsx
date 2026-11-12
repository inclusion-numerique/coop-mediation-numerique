'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type {
  FiltresDeLaListe,
  OptionDeMediateur,
} from '@app/web/features/activites/ui/filtres/filtres-de-la-liste'
import { OptionDeBeneficiaire } from '@app/web/features/activites/ui/filtres/filtres-de-la-liste'
import {
  generateActivitesFiltersLabels,
  toLieuPrefix,
} from '@app/web/features/activites/ui/filtres/libelles-des-filtres'
import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { useRouter, useSearchParams } from 'next/navigation'

const queryParamsToKeep = ['voir-rdvs']

export const FilterTags = ({
  filters,
  lieuxActiviteOptions,
  mediateursOptions,
  beneficiairesOptions,
  structuresEmployeusesOptions,
  departementsOptions,
  communesOptions,
  tagsOptions,
  optionsDesSources,
}: {
  filters: FiltresDeLaListe
  mediateursOptions: OptionDeMediateur[]
  beneficiairesOptions: OptionDeBeneficiaire[]
  structuresEmployeusesOptions: { id: string; nom: string }[]
  lieuxActiviteOptions: SelectOption[]
  departementsOptions: SelectOption[]
  communesOptions: SelectOption[]
  optionsDesSources: SelectOption[]
  tagsOptions: { id: string; nom: string }[]
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
    structuresEmployeusesOptions,
    tagsOptions,
    optionsDesSources,
  }).map(toLieuPrefix)

  const handleRemoveFilter = (key: string, value: string | string[]) => {
    if (key === 'rdvs' && value === 'tous') {
      params.delete('rdvs')
    }

    if (Array.isArray(value)) {
      value.map((param) => params.delete(param))
      return router.replace(`?${params}`, { scroll: false })
    }

    const updatedValues = (params.get(key)?.split(',') ?? []).filter(
      (v) => v !== value,
    )

    updatedValues.length > 0
      ? params.set(key, updatedValues.join(','))
      : params.delete(key)

    router.replace(`?${params}`, { scroll: false })
  }

  const handleClearFilters = () => {
    const newQueryParams = new URLSearchParams(
      queryParamsToKeep.flatMap((paramToKeep) => {
        const valeur = searchParams.get(paramToKeep)
        return valeur === null ? [] : [[paramToKeep, valeur]]
      }),
    )
    router.replace(`?${newQueryParams}`, { scroll: false })
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
