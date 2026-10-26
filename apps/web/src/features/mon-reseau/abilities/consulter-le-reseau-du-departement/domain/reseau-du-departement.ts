import type {
  CodeDepartement,
  Departement,
} from '@app/web/libraries/departement'
import type { Effectif } from '../../../domain'

export type ReseauDuDepartement = {
  readonly departement: Departement
  readonly acteurs: Effectif
  readonly lieux: Effectif
}

export type CompterLesActeursDuDepartement = (
  departement: CodeDepartement,
) => Promise<Effectif>

export type CompterLesLieuxDuDepartement = (
  departement: CodeDepartement,
) => Promise<Effectif>
