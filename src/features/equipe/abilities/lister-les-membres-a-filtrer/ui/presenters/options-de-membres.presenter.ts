import type { SelectOption } from '@/libraries/ui'
import type { MembreAFiltrer } from '../../domain'

export const optionDeMembre = ({
  mediateurId,
  nom,
}: MembreAFiltrer): SelectOption => ({ value: mediateurId, label: nom })
