'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { MediateurFilter } from '@app/web/components/filters/MediateurFilter'
import { LieuFilter } from '@app/web/features/lieux-activite/use-cases/filter/LieuFilter'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import classNames from 'classnames'
import type { LieuxFilters } from '../validation/LieuxFilters'

const Filters = ({
  defaultFilters,
  communesOptions,
  departementsOptions,
  mediateursOptions,
  className,
}: {
  defaultFilters: LieuxFilters
  communesOptions: SelectOption[]
  departementsOptions: SelectOption[]
  mediateursOptions: MediateurOption[]
  className?: string
}) => (
  <div
    className={classNames(
      'fr-flex fr-align-items-start fr-flex-wrap fr-flex-gap-2v',
      className,
    )}
  >
    <LieuFilter
      defaultValue={[
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
      lieuxActiviteOptions={[]}
      communesOptions={communesOptions}
      departementsOptions={departementsOptions}
    />
    <MediateurFilter
      initialMediateursOptions={mediateursOptions}
      defaultValue={defaultFilters.mediateurs ?? []}
    />
  </div>
)

export default Filters
