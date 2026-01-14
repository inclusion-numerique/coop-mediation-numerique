import type { Departement } from '@app/web/data/collectivites-territoriales/departements'

export const getMonReseauBreadcrumbLabel = ({
  code,
}: Pick<Departement, 'code'>) => `Mon réseau (${code})`

export const getMonReseauBreadcrumbParents = ({
  code,
}: Pick<Departement, 'code'>) => [
  {
    label: getMonReseauBreadcrumbLabel({ code }),
    linkProps: { href: `/coop/mon-reseau/${code}` },
  },
]
