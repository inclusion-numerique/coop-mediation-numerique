import { hrefDesLieux, hrefDuReseau } from './liens.presenter'

export const libelleDuReseau = (departement: string): string =>
  `Mon réseau (${departement})`

export const filDArianeDuReseau = (departement: string) => [
  {
    label: libelleDuReseau(departement),
    linkProps: { href: hrefDuReseau(departement) },
  },
]

export const filDArianeDesLieux = (departement: string) => [
  ...filDArianeDuReseau(departement),
  {
    label: "Annuaire des lieux d'activités",
    linkProps: { href: hrefDesLieux(departement) },
  },
]
