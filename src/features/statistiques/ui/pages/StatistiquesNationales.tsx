import type { SelectOption } from '@app/ui/components/Form/utils/options'
import Filters from '@app/web/features/statistiques/ui/filtres/Filters'
import { FilterTags } from '@app/web/features/statistiques/ui/filtres/FilterTags'
import type { ActivitesFilters } from '@app/web/features/statistiques/ui/filtres/parametres-de-la-barre'
import type { ComponentProps, ReactNode } from 'react'
import type { VocabulaireDeLaBarre } from '../filtres/vocabulaire-de-la-barre'

export const StatistiquesNationales = ({
  activitesFilters,
  vocabulaire,
  filtreDeLieu,
  communesOptions,
  departementsOptions,
  lieuxActiviteOptions,
  tagsOptions,
  activiteSourceOptions,
  generale,
  activites,
  beneficiaires,
}: {
  activitesFilters: ActivitesFilters
  vocabulaire: VocabulaireDeLaBarre
  filtreDeLieu: ReactNode
  communesOptions: SelectOption[]
  departementsOptions: SelectOption[]
  lieuxActiviteOptions: SelectOption[]
  tagsOptions: ComponentProps<typeof Filters>['tagsOptions']
  activiteSourceOptions: SelectOption[]
  generale: ReactNode
  activites: ReactNode
  beneficiaires: ReactNode
}) => (
  <>
    <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mb-3w">
      <Filters
        defaultFilters={activitesFilters}
        vocabulaire={vocabulaire}
        filtreDeLieu={filtreDeLieu}
        structuresEmployeusesOptions={[]}
        tagsOptions={tagsOptions}
        initialMediateursOptions={[]}
        initialBeneficiairesOptions={[]}
        minDate={new Date('2020-01-01')}
        beneficiairesFilter={false}
        isCoordinateur={false}
        isMediateur={false}
        hasCrasV1={true}
      />
    </div>
    <FilterTags
      filters={activitesFilters}
      communesOptions={communesOptions}
      departementsOptions={departementsOptions}
      lieuxActiviteOptions={lieuxActiviteOptions}
      structuresEmployeusesOptions={[]}
      tagsOptions={tagsOptions}
      mediateursOptions={[]}
      beneficiairesOptions={[]}
      activiteSourceOptions={activiteSourceOptions}
      vocabulaire={vocabulaire}
    />
    <section className="fr-mb-6w">{generale}</section>
    <section className="fr-mb-6w">{activites}</section>
    <section className="fr-mb-6w">{beneficiaires}</section>
  </>
)
