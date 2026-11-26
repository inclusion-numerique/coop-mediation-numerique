import type { CodeDepartement } from '@/libraries/insee'
import type { Effectif } from '../../../domain'

export type CompterLesActeursDuDepartement = (
  departement: CodeDepartement,
) => Promise<Effectif>

export type NombreDeLieuxDuDepartement = (
  departement: CodeDepartement,
) => Promise<number>

export type ConsulterLeReseauDuDepartementPorts = {
  readonly compterLesActeursDuDepartement: CompterLesActeursDuDepartement
  readonly nombreDeLieuxDuDepartement: NombreDeLieuxDuDepartement
}
