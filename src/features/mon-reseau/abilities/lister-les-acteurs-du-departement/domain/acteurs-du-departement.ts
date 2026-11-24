import type { Paginated } from '@arckit/resultset'
import type { CodeDepartement } from '@/libraries/insee'
import type { Acteur } from '../../../domain'
import type { CriteresActeurs } from './criteres-acteurs'

export type PageDActeurs = Paginated<Acteur>

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
