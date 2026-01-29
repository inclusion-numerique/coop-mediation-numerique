'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import classNames from 'classnames'
import type { ActeursFilters } from '../validation/ActeursFilters'
import { ActeurRoleFilter } from './ActeurRoleFilter'
import { CommuneFilter } from './CommuneFilter'

const Filters = ({
  defaultFilters,
  communesOptions,
  className,
}: {
  defaultFilters: ActeursFilters
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
    <ActeurRoleFilter defaultValue={defaultFilters.role} />
  </div>
)

export default Filters
