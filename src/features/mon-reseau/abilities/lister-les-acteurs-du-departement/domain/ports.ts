import type { Paginated } from '@arckit/resultset'
import type { CodeDepartement } from '@/libraries/insee'
import type { ActeurAvecCommunes, CommunesDesLieux } from '../../../domain'
import type { CriteresActeurs } from './criteres-acteurs'

export type LireLesActeursDuDepartement = (
  departement: CodeDepartement,
  criteres: CriteresActeurs,
) => Promise<Paginated<ActeurAvecCommunes>>

export type ListerLesActeursDuDepartementPorts<Communes> = {
  readonly acteursDuDepartement: LireLesActeursDuDepartement
  readonly communesDesLieux: CommunesDesLieux<Communes>
}
