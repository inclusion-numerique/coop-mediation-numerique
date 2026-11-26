import type { Departement } from '@/libraries/departement'
import type { CriteresDesLieux } from './criteres-des-lieux'
import type { OptionDeCommune } from './ports'

export type LieuxConsultes<Lieux> = {
  readonly departement: Departement
  readonly criteres: CriteresDesLieux
  readonly lieux: Lieux
  readonly communes: readonly OptionDeCommune[]
}
