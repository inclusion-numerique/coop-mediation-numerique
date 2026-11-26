import type { CodeDepartement } from '@/libraries/insee'
import type { CriteresDesLieux } from './criteres-des-lieux'

export type OptionDeCommune = {
  readonly value: string
  readonly label: string
}

export type LieuxDuDepartement<Lieux> = (options: {
  departementCode: CodeDepartement
  criteres: CriteresDesLieux
}) => Promise<Lieux>

export type CommunesDesLieux = (options: {
  departementCode: CodeDepartement
}) => Promise<{ readonly communesOptions: readonly OptionDeCommune[] }>

export type ConsulterLesLieuxDuDepartementPorts<Lieux> = {
  readonly lieuxDuDepartement: LieuxDuDepartement<Lieux>
  readonly communesDesLieux: CommunesDesLieux
}
