import type { CodeDepartement } from '@/libraries/insee'
import type { CommunesDesLieux } from '../../../domain'
import type { CriteresDesLieux } from './criteres-des-lieux'

export type LieuxDuDepartement<Lieux> = (options: {
  readonly departementCode: CodeDepartement
  readonly criteres: CriteresDesLieux
}) => Promise<Lieux>

export type ConsulterLesLieuxDuDepartementPorts<Lieux, Communes> = {
  readonly lieuxDuDepartement: LieuxDuDepartement<Lieux>
  readonly communesDesLieux: CommunesDesLieux<Communes>
}
