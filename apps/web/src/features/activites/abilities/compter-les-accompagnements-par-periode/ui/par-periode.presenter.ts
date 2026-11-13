import type { LabelAndCount } from '@app/web/libs/statistiques/quantifiedShare'
import type { AccompagnementsParPeriode } from '../domain'

const libelleDuJour = (jour: string): string =>
  `${jour.slice(8, 10)}/${jour.slice(5, 7)}`

const libelleDuMois = (mois: string): string =>
  `${mois.slice(5, 7)}/${mois.slice(2, 4)}`

export const parPeriodePresentes = ({
  parJour,
  parMois,
}: AccompagnementsParPeriode): {
  accompagnementsParJour: LabelAndCount[]
  accompagnementsParMois: LabelAndCount[]
} => ({
  accompagnementsParJour: parJour.map(({ jour, nombre }) => ({
    label: libelleDuJour(jour),
    count: nombre,
  })),
  accompagnementsParMois: parMois.map(({ mois, nombre }) => ({
    label: libelleDuMois(mois),
    count: nombre,
  })),
})
