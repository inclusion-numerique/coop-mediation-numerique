import { SelectOption } from '@app/ui/components/Form/utils/options'
import classNames from 'classnames'
import PageSizeSelect from './PageSizeSelect'
import PaginationNav, { PaginationNavProps } from './PaginationNav'

export type PaginationNavWithPageSizeProps = PaginationNavProps & {
  pageSizeOptions: SelectOption[]
  defaultPageSize: number
}

const PaginationNavWithPageSizeSelect = ({
  className,
  ...paginationProps
}: PaginationNavWithPageSizeProps) => (
  <div
    className={classNames(
      'fr-flex fr-width-full fr-justify-content-space-between fr-align-items-center fr-direction-column fr-direction-sm-row fr-flex-gap-4v',
      className,
    )}
  >
    <PageSizeSelect {...paginationProps} />
    <PaginationNav
      {...paginationProps}
      className="fr-flex-grow-1 fr-justify-content-end"
    />
  </div>
)

export default PaginationNavWithPageSizeSelect
