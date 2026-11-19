import type { CodeDepartement } from '@/libraries/insee'
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
  readonly page: NumeroDePage
  readonly lignes: LignesParPage
}

type OptionDeCommune = {
  readonly value: string
  readonly label: string
}

export type ListerLesActeursDuDepartement = (
  departement: CodeDepartement,
  criteres: CriteresActeurs,
) => Promise<PageDActeurs>

export type CommunesDesLieux = (options: {
  departementCode: CodeDepartement
}) => Promise<{ readonly communesOptions: readonly OptionDeCommune[] }>
