import type { CodeDepartement } from '@/libraries/insee'
import type { OptionDeCommune, PageDActeurs } from './acteurs-du-departement'
import type { CriteresActeurs } from './criteres-acteurs'

export type LireLesActeursDuDepartement = (
  departement: CodeDepartement,
  criteres: CriteresActeurs,
) => Promise<PageDActeurs>

export type CommunesDesLieux = (options: {
  departementCode: CodeDepartement
}) => Promise<{ readonly communesOptions: readonly OptionDeCommune[] }>

export type ListerLesActeursDuDepartementPorts = {
  readonly acteursDuDepartement: LireLesActeursDuDepartement
  readonly communesDesLieux: CommunesDesLieux
}
