import Breadcrumbs, {
  type BreadcrumbParents,
} from '@/libraries/ui/components/Breadcrumbs'

type CoopBreadcrumbsProps<T extends string> = {
  currentPage: string
  parents?: BreadcrumbParents<T>
  className?: string
}

const CoopBreadcrumbs = <T extends string>({
  currentPage,
  parents = [],
  className,
}: CoopBreadcrumbsProps<T>) => (
  <Breadcrumbs
    currentPage={currentPage}
    parents={parents}
    homeLinkHref="/coop"
    className={className ?? 'fr-mb-5v'}
  />
)

export default CoopBreadcrumbs
