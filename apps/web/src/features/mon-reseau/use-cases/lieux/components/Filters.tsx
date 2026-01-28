'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { CommuneFilter } from '@app/web/features/mon-reseau/use-cases/acteurs/components/CommuneFilter'
import classNames from 'classnames'
import type { LieuxFilters } from '../validation/LieuxFilters'

const Filters = ({
  defaultFilters,
  communesOptions,
  className,
}: {
  defaultFilters: LieuxFilters
  communesOptions: SelectOption[]
  className?: string
}) => (
  <div
    className={classNames(
      'fr-flex fr-align-items-start fr-flex-wrap fr-flex-gap-2v',
      className,
    )}
  >
    <CommuneFilter
      defaultValue={defaultFilters.communes ?? []}
      communesOptions={communesOptions}
    />
  </div>
)

export default Filters
