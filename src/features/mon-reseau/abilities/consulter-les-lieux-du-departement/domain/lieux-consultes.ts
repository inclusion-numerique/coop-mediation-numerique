import type { Departement } from '@/libraries/departement'
import type { CriteresDesLieux } from './criteres-des-lieux'

export type LieuxConsultes<Lieux, Communes> = {
  readonly departement: Departement
  readonly criteres: CriteresDesLieux
  readonly lieux: Lieux
  readonly communes: Communes
}
