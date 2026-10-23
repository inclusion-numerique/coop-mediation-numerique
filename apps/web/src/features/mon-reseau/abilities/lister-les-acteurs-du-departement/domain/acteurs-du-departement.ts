import type { CodeDepartement } from '@app/web/libraries/departement'
import type {
  Acteur,
  Effectif,
  LignesParPage,
  NumeroDePage,
} from '../../../domain'
import type { CriteresActeurs } from './criteres-acteurs'

export type PageDActeurs = {
  readonly acteurs: readonly Acteur[]
  readonly total: Effectif
  readonly pages: number
  readonly page: NumeroDePage
  readonly lignes: LignesParPage
}

export type OptionDeCommune = {
  readonly value: string
  readonly label: string
}

export type ListerLesActeursDuDepartement = (
  departement: CodeDepartement,
  criteres: CriteresActeurs,
) => Promise<PageDActeurs>

export type CommunesDuDepartement = (
  departement: CodeDepartement,
) => Promise<readonly OptionDeCommune[]>
