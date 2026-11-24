import { SelectOption } from '@/libraries/ui/components/Form/utils/options'

export const matchingOption =
  (option: SelectOption) =>
  ({ value }: { value: string }) =>
    value !== option.value

export const defautValuesFrom =
  (defaultValues: Set<string>) =>
  ({ value }: { value: string }) =>
    defaultValues.has(value)

export const availableOptionsIn =
  (options: SelectOption[]) => (option: SelectOption) =>
    options.every(({ value }) => value !== option.value)
