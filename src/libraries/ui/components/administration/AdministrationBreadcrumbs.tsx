import Breadcrumbs, {
  type BreadcrumbParents,
} from '@/libraries/ui/components/Breadcrumbs'

const AdministrationBreadcrumbs = <T extends string>({
  currentPage,
  parents = [],
  className,
}: {
  currentPage: string
  parents?: BreadcrumbParents<T>
  className?: string
}) => (
  <Breadcrumbs
    currentPage={currentPage}
    parents={parents}
    homeLinkHref="/administration"
    className={className ?? 'fr-mb-4v'}
  />
)

export default AdministrationBreadcrumbs
