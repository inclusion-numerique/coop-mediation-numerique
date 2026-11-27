import type { CodeDepartement } from '@/libraries/insee'
import type { CommunesDesLieux } from '../../../domain'
import type { PageDActeurs } from './acteurs-du-departement'
import type { CriteresActeurs } from './criteres-acteurs'

export type LireLesActeursDuDepartement = (
  departement: CodeDepartement,
  criteres: CriteresActeurs,
) => Promise<PageDActeurs>

export type ListerLesActeursDuDepartementPorts<Communes> = {
  readonly acteursDuDepartement: LireLesActeursDuDepartement
  readonly communesDesLieux: CommunesDesLieux<Communes>
}
