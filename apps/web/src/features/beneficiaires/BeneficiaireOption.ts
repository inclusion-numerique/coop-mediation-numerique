import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { BeneficiaireData } from './validation/BeneficiaireValidation'

export type BeneficiaireOption = SelectOption<BeneficiaireData | null>
