import type { Paginated } from '@arckit/resultset'
import type { Departement } from '@/libraries/departement'
import type { Acteur, OptionDeCommune } from '../../../domain'
import type { CriteresActeurs } from './criteres-acteurs'

export type PageDActeurs = Paginated<Acteur>

export type ActeursDuDepartement = {
  readonly departement: Departement
  readonly criteres: CriteresActeurs
  readonly acteurs: PageDActeurs
  readonly communes: readonly OptionDeCommune[]
}
