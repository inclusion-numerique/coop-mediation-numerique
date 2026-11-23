'use client'

import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import { FiltreCommune } from '../../../../ui/components/FiltreCommune'
import { FiltreRole } from './FiltreRole'

const Filtres = ({
  communes,
  role,
  options,
}: {
  communes: readonly string[]
  role: string | null
  options: SelectOption[]
}) => (
  <div className="fr-flex fr-align-items-start fr-flex-wrap fr-flex-gap-2v">
    <FiltreCommune defaultValue={[...communes]} communesOptions={options} />
    <FiltreRole role={role} />
  </div>
)

export default Filtres
