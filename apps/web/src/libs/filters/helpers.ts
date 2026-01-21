import { SelectOption } from '@app/ui/components/Form/utils/options'

/**
 * Removes the page parameter from URLSearchParams.
 * Should be called when filters change to reset pagination to page 1,
 * otherwise users may end up on an empty page if the new filtered results
 * have fewer pages than the current page number.
 */
export const resetPagination = (params: URLSearchParams) => {
  params.delete('page')
}

export const matchingOption =
  (option: SelectOption) =>
  ({ value }: { value: string }) =>
    value !== option.value

const toValue = ({ value }: { value: string }) => value

export const update =
  <T extends string>(params: URLSearchParams) =>
  (type: T, options: SelectOption[]) => {
    options.length > 0
      ? params.set(type, options.map(toValue).join(','))
      : params.delete(type)
  }

export const defautValuesFrom =
  (defaultValues: Set<string>) =>
  ({ value }: { value: string }) =>
    defaultValues.has(value)

export const availableOptionsIn =
  (options: SelectOption[]) => (option: SelectOption) =>
    options.every(({ value }) => value !== option.value)
