'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import {
  generateActivitesFiltersLabels,
  toLieuPrefix,
} from '@app/web/features/statistiques/ui/filtres/libelles-des-filtres'
import type { MediateurOption } from '@app/web/features/statistiques/ui/filtres/mediateur-option'
import type { ActivitesFilters } from '@app/web/features/statistiques/ui/filtres/parametres-de-la-barre'
import { adresseAvec } from '@app/web/libraries/parametres-d-url'
import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { useRouter, useSearchParams } from 'next/navigation'
import type { OptionDeBeneficiaire } from './option-de-beneficiaire'
import type { VocabulaireDeLaBarre } from './vocabulaire-de-la-barre'

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
  activiteSourceOptions,
  vocabulaire,
}: {
  filters: ActivitesFilters
  mediateursOptions: MediateurOption[]
  beneficiairesOptions: OptionDeBeneficiaire[]
  structuresEmployeusesOptions: { id: string; nom: string }[]
  lieuxActiviteOptions: SelectOption[]
  departementsOptions: SelectOption[]
  communesOptions: SelectOption[]
  activiteSourceOptions: SelectOption[]
  vocabulaire: VocabulaireDeLaBarre
  tagsOptions: { id: string; nom: string }[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filterLabelsToDisplay = generateActivitesFiltersLabels(filters, {
    vocabulaire,
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
    beneficiairesOptions,
    mediateursOptions,
    structuresEmployeusesOptions,
    tagsOptions,
    activiteSourceOptions,
  }).map(toLieuPrefix)

  const handleRemoveFilter = (key: string, value: string | string[]) => {
    if (Array.isArray(value)) {
      return router.replace(
        adresseAvec(
          `?${searchParams}`,
          Object.fromEntries(value.map((cle) => [cle, null])),
        ) || '?',
        { scroll: false },
      )
    }

    const restantes = (searchParams.get(key)?.split(',') ?? []).filter(
      (v) => v !== value,
    )

    return router.replace(
      adresseAvec(`?${searchParams}`, {
        [key]: restantes.length > 0 ? restantes.join(',') : null,
        ...(key === 'rdvs' && value === 'tous' ? { rdvs: null } : {}),
      }) || '?',
      { scroll: false },
    )
  }

  const handleClearFilters = () => {
    const newQueryParams = new URLSearchParams(
      queryParamsToKeep.flatMap((paramToKeep) =>
        searchParams.has(paramToKeep)
          ? [[paramToKeep, searchParams.get(paramToKeep) ?? '']]
          : [],
      ),
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
