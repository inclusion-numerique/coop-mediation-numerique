import type { CodeDepartement } from '@/libraries/insee'
import type { CommunesDesLieux } from '../../../domain'
import type { CriteresDesLieux } from './criteres-des-lieux'

export type LieuxDuDepartement<Lieux> = (options: {
  departementCode: CodeDepartement
  criteres: CriteresDesLieux
}) => Promise<Lieux>

export type ConsulterLesLieuxDuDepartementPorts<Lieux> = {
  readonly lieuxDuDepartement: LieuxDuDepartement<Lieux>
  readonly communesDesLieux: CommunesDesLieux
}
