import { Sort } from '@arckit/resultset'
import {
  type AdresseCourante,
  composerLEtat,
  pagination,
  triParmi,
} from '@/libraries/etat-d-url'

export const paginationDesActivites = pagination({
  lignes: [10, 20, 50, 100],
  parDefaut: 50,
})

export const listeDesActivites = composerLEtat(
  triParmi({ colonnes: ['date'], parDefaut: Sort('date', 'desc') }),
  paginationDesActivites,
)

export const lectureDeLaPagination = (
  parametres: AdresseCourante['parametres'],
) => {
  const { tri, pagination: lue } = listeDesActivites.charger(parametres)
  return { pagination: lue, ordre: tri }
}
