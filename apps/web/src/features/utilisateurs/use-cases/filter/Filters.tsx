'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { LieuActiviteOption } from '@app/web/features/lieux-activite/getLieuxActiviteOptions'
import { LieuFilter } from '@app/web/features/lieux-activite/use-cases/filter/LieuFilter'
import classNames from 'classnames'
import React from 'react'
import { DispositifFilter } from './DispositifFilter'
import { RoleFilter } from './RoleFilter'
import { StatutFilter } from './StatutFilter'
import { UtilisateursFilters } from './utilisateursFilters'

const Filters = ({
  defaultFilters,
  communesOptions,
  lieuxActiviteOptions,
  departementsOptions,
  className,
}: {
  defaultFilters: UtilisateursFilters
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
    <RoleFilter defaultValue={defaultFilters.roles} />
    <DispositifFilter defaultValue={defaultFilters.conseiller_numerique} />
    <StatutFilter defaultValue={defaultFilters.statut} />
    <LieuFilter
      lieuxParams={lieuxActiviteOptions}
      communesParams={communesOptions}
      departementsParams={departementsOptions}
    />
  </div>
)

export default Filters
