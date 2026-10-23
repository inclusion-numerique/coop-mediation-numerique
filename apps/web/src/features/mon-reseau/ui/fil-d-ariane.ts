import { hrefDuReseau } from './liens'

export const libelleDuReseau = (departement: string): string =>
  `Mon réseau (${departement})`

export const filDArianeDuReseau = (departement: string) => [
  {
    label: libelleDuReseau(departement),
    linkProps: { href: hrefDuReseau(departement) },
  },
]
