import { Sort } from '@arckit/resultset'
import {
  type AdresseCourante,
  composerLEtat,
} from '@/libraries/etat-d-url/definition/composition'
import { pagination } from '@/libraries/etat-d-url/definition/pagination'
import { triParmi } from '@/libraries/etat-d-url/definition/tri-parmi'

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
