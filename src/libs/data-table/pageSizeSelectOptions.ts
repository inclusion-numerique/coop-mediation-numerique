import { SelectOption } from '@app/web/libraries/ui/components/Form/utils/options'

export const generatePageSizeSelectOptions = (
  pageSizes: [number, ...number[]],
): SelectOption[] =>
  pageSizes.map((pageSize) => ({
    value: pageSize.toString(10),
    label: `${pageSize} lignes par page`,
  }))
