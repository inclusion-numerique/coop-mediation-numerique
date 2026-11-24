import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb'
import type { Route } from 'next'

type BreadcrumbParent<T extends string> = {
  label: string
  linkProps: { href: Route<T> }
}
export type BreadcrumbParents<T extends string = string> = BreadcrumbParent<T>[]

const Breadcrumbs = <T extends string, Accueil extends string = '/'>({
  currentPage,
  parents = [],
  homeLinkHref,
  className,
}: {
  currentPage: string
  parents?: BreadcrumbParents<T> | undefined
  homeLinkHref?: Route<Accueil> | undefined
  className?: string | undefined
}) => (
  <Breadcrumb
    currentPageLabel={currentPage}
    homeLinkProps={{
      href: homeLinkHref ?? '/',
    }}
    segments={parents}
    {...(className === undefined ? {} : { className })}
  />
)

export default Breadcrumbs
