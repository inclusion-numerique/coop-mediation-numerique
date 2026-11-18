import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'

export const generatePageSizeSelectOptions = (
  pageSizes: [number, ...number[]],
): SelectOption[] =>
  pageSizes.map((pageSize) => ({
    value: pageSize.toString(10),
    label: `${pageSize} lignes par page`,
  }))

export const DEFAULT_PAGE = 1

export const DEFAULT_PAGE_SIZE = 50
