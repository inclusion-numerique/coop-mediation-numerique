import {
  premiereValeur,
  type ValeurDeParametre,
  valeurLue,
} from '@/libraries/parametres-d-url'
import {
  LIGNES_PAR_DEFAUT,
  LignesParPage,
  NumeroDePage,
  type Pagination,
} from '../../domain'

const nombre = (valeur: ValeurDeParametre): number =>
  Number(premiereValeur(valeur) ?? Number.NaN)

export const paginationLue = ({
  page,
  lignes,
}: {
  readonly page?: ValeurDeParametre
  readonly lignes?: ValeurDeParametre
}): Pagination => ({
  page: valeurLue(NumeroDePage.schema, nombre(page)) ?? NumeroDePage(1),
  lignesParPage:
    valeurLue(LignesParPage.schema, nombre(lignes)) ??
    LignesParPage(LIGNES_PAR_DEFAUT),
})
