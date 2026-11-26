import type { Departement } from '@/libraries/departement'
import type { OptionDeCommune } from '../../../domain'
import type { CriteresDesLieux } from './criteres-des-lieux'

export type LieuxConsultes<Lieux> = {
  readonly departement: Departement
  readonly criteres: CriteresDesLieux
  readonly lieux: Lieux
  readonly communes: readonly OptionDeCommune[]
}
