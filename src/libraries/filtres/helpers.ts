import { SelectOption } from '@/libraries/ui/components/Form/utils/options'

export const matchingOption =
  (option: SelectOption) =>
  ({ value }: { value: string }) =>
    value !== option.value
