import type { Paginated } from '@arckit/resultset'
import type { Departement } from '@/libraries/departement'
import type { Acteur } from '../../../domain'
import type { CriteresActeurs } from './criteres-acteurs'

export type PageDActeurs = Paginated<Acteur>

export type ActeursDuDepartement<Communes> = {
  readonly departement: Departement
  readonly criteres: CriteresActeurs
  readonly acteurs: PageDActeurs
  readonly communes: Communes
}
