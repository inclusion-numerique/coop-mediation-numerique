import type { SelectOption } from '@/libraries/ui/form'
import type { CoordinateurAChoisir } from '../../domain'

export const optionDuCoordinateur = ({
  id,
  nomAffiche,
}: CoordinateurAChoisir): SelectOption => ({ value: id, label: nomAffiche })
