import type { SelectOption } from '@app/ui/components/Form/utils/options'
import classNames from 'classnames'
import { PageSizeSelect } from './PageSizeSelect'
import { PaginationNav, type PaginationNavProps } from './PaginationNav'

export type PaginationNavWithPageSizeProps = PaginationNavProps & {
  pageSizeOptions: SelectOption[]
  defaultPageSize: number
}

export const PaginationNavWithPageSizeSelect = ({
  className,
  pageSizeOptions,
  defaultPageSize,
  ...paginationProps
}: PaginationNavWithPageSizeProps) => (
  <div
    className={classNames(
      'fr-flex fr-width-full fr-justify-content-space-between fr-align-items-center fr-direction-column fr-direction-sm-row fr-flex-gap-4v',
      className,
    )}
  >
    <PageSizeSelect
      baseHref={paginationProps.baseHref}
      state={paginationProps.state}
      pageSizeOptions={pageSizeOptions}
      defaultPageSize={defaultPageSize}
    />
    <PaginationNav
      {...paginationProps}
      className="fr-flex-grow-1 fr-justify-content-end"
    />
  </div>
)
