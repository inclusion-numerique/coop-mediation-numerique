'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { ActiviteTypeFilter } from '@app/web/components/filters/ActiviteTypeFilter'
import { BeneficiaireFilter } from '@app/web/components/filters/BeneficiaireFilter'
import { ConseillerNumeriqueFilter } from '@app/web/components/filters/ConseillerNumeriqueFilter'
import { MediateurFilter } from '@app/web/components/filters/MediateurFilter'
import { PeriodeFilter } from '@app/web/components/filters/PeriodeFilter'
import type { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { LieuFilter } from '@app/web/features/lieux-activite/use-cases/filter/LieuFilter'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import classNames from 'classnames'
import type { ActivitesFilters } from '../validation/ActivitesFilters'

const Filters = ({
  defaultFilters,
  initialMediateursOptions,
  initialBeneficiairesOptions,
  communesOptions,
  departementsOptions,
  lieuxActiviteOptions,
  isCoordinateur,
  isMediateur,
  beneficiairesFilter = true,
  minDate,
  className,
  enableRdvsFilter = false,
}: {
  defaultFilters: ActivitesFilters
  initialMediateursOptions: MediateurOption[]
  initialBeneficiairesOptions: BeneficiaireOption[]
  communesOptions: SelectOption[]
  lieuxActiviteOptions: LieuActiviteOption[]
  departementsOptions: SelectOption[]
  isCoordinateur: boolean
  isMediateur: boolean
  beneficiairesFilter?: boolean
  minDate?: Date
  className?: string
  enableRdvsFilter?: boolean
}) => (
  <div
    className={classNames(
      'fr-flex fr-align-items-start fr-flex-wrap fr-flex-gap-2v',
      className,
    )}
  >
    {isCoordinateur && (
      <MediateurFilter
        initialMediateursOptions={initialMediateursOptions}
        defaultValue={defaultFilters.mediateurs ?? []}
      />
    )}
    <PeriodeFilter
      minDate={minDate ?? new Date()}
      defaultValue={
        defaultFilters.au && defaultFilters.du
          ? {
              du: defaultFilters.du,
              au: defaultFilters.au,
            }
          : undefined
      }
    />
    <LieuFilter
      defaultValue={[
        ...(defaultFilters.lieux == null
          ? []
          : [{ type: 'lieu' as const, value: defaultFilters.lieux }]),
        ...(defaultFilters.communes == null
          ? []
          : [{ type: 'commune' as const, value: defaultFilters.communes }]),
        ...(defaultFilters.departements == null
          ? []
          : [
              {
                type: 'departement' as const,
                value: defaultFilters.departements,
              },
            ]),
      ]}
      lieuxActiviteOptions={lieuxActiviteOptions}
      communesOptions={communesOptions}
      departementsOptions={departementsOptions}
    />
    <ActiviteTypeFilter
      defaultValue={{
        types: defaultFilters.types ?? [],
        rdvs: defaultFilters.rdvs ?? [],
      }}
      enableRdvsFilter={enableRdvsFilter}
    />
    {isCoordinateur && (
      <ConseillerNumeriqueFilter
        defaultValue={defaultFilters.conseiller_numerique}
      />
    )}
    {isMediateur && beneficiairesFilter && (
      <BeneficiaireFilter
        initialBeneficiairesOptions={initialBeneficiairesOptions}
        defaultValue={defaultFilters.beneficiaires ?? []}
      />
    )}
  </div>
)

export default Filters
