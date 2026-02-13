import Breadcrumbs, {
  type BreadcrumbParents,
} from '@app/web/components/Breadcrumbs'

export type CoopBreadcrumbsProps = {
  currentPage: string
  parents?: BreadcrumbParents
  className?: string
}

const CoopBreadcrumbs = ({
  currentPage,
  parents = [],
  className,
}: CoopBreadcrumbsProps) => (
  <Breadcrumbs
    currentPage={currentPage}
    parents={parents}
    homeLinkHref="/coop"
    className={className ?? 'fr-mb-5v'}
  />
)

export default CoopBreadcrumbs
