import type { Departement } from '@/libraries/departement'
import type { Effectif } from '../../../domain'

export type ReseauDuDepartement = {
  readonly departement: Departement
  readonly acteurs: Effectif
  readonly lieux: Effectif
}
