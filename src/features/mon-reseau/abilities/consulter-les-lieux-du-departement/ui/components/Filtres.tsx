'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { FiltreCommune } from '../../../../ui/FiltreCommune'

const Filtres = ({
  communes,
  options,
}: {
  communes: readonly string[]
  options: SelectOption[]
}) => (
  <div className="fr-flex fr-align-items-start fr-flex-wrap fr-flex-gap-2v">
    <FiltreCommune defaultValue={[...communes]} communesOptions={options} />
  </div>
)

export default Filtres
