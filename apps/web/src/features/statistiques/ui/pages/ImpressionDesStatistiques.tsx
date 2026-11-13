import type { SelectOption } from '@app/ui/components/Form/utils/options'
import {
  generateActivitesFiltersLabels,
  toLieuPrefix,
} from '@app/web/features/statistiques/ui/filtres/libelles-des-filtres'
import type { ActivitesFilters } from '@app/web/features/statistiques/ui/filtres/parametres-de-la-barre'
import Tag from '@codegouvfr/react-dsfr/Tag'
import type { ReactNode } from 'react'
import type { MediateurOption } from '../filtres/mediateur-option'
import type { VocabulaireDeLaBarre } from '../filtres/vocabulaire-de-la-barre'

export const ImpressionDesStatistiques = ({
  activitesFilters,
  communesOptions,
  departementsOptions,
  initialMediateursOptions,
  lieuxActiviteOptions,
  tagsOptions,
  activiteSourceOptions,
  vocabulaire,
  generale,
  activites,
  beneficiaires,
}: {
  activitesFilters: ActivitesFilters
  communesOptions: SelectOption[]
  departementsOptions: SelectOption[]
  initialMediateursOptions: MediateurOption[]
  lieuxActiviteOptions: SelectOption[]
  tagsOptions: { id: string; nom: string }[]
  activiteSourceOptions: SelectOption[]
  vocabulaire: VocabulaireDeLaBarre
  generale: ReactNode
  activites: ReactNode
  beneficiaires: ReactNode
}) => {
  const filterLabelsToDisplay = generateActivitesFiltersLabels(
    activitesFilters,
    {
      vocabulaire,
      communesOptions,
      departementsOptions,
      lieuxActiviteOptions,
      beneficiairesOptions: [],
      mediateursOptions: initialMediateursOptions,
      structuresEmployeusesOptions: [],
      tagsOptions,
      activiteSourceOptions,
    },
  ).map(toLieuPrefix)

  return (
    <div className="fr-print" aria-hidden>
      <h1 className="fr-text-title--blue-france fr-my-2w">Mes statistiques</h1>
      {filterLabelsToDisplay.length > 0 && (
        <section>
          <h2 className="fr-h3">Filtres activés</h2>
          <ul className="fr-tags-group">
            {filterLabelsToDisplay.map((filter) => (
              <li
                className="fr-line-height-1"
                key={`${filter.type}-${filter.key}`}
              >
                <Tag small>{filter.label}</Tag>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="fr-pt-6v">{generale}</section>
      <section className="fr-pt-6v">{activites}</section>
      <section className="fr-pt-6v">{beneficiaires}</section>
    </div>
  )
}
