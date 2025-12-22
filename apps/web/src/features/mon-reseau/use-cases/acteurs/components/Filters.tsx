'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { LieuFilter } from '@app/web/features/lieux-activite/use-cases/filter/LieuFilter'
import classNames from 'classnames'
import type { ActeursFilters } from '../validation/ActeursFilters'
import { ActeurRoleFilter } from './ActeurRoleFilter'

const Filters = ({
  defaultFilters,
  communesOptions,
  departementsOptions,
  lieuxActiviteOptions,
  className,
}: {
  defaultFilters: ActeursFilters
  communesOptions: SelectOption[]
  lieuxActiviteOptions: LieuActiviteOption[]
  departementsOptions: SelectOption[]
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
    <ActeurRoleFilter defaultValue={defaultFilters.role} />
  </div>
)

export default Filters
