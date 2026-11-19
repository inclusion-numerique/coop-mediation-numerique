import type { CodeDepartement } from '@/libraries/insee'
import type { CriteresDesLieux } from './criteres-des-lieux'

type OptionDeCommune = {
  readonly value: string
  readonly label: string
}

export type LieuxDuDepartement<Lieux> = (options: {
  departementCode: CodeDepartement
  searchParams: {
    readonly recherche?: string
    readonly communes: readonly string[]
    readonly tri: CriteresDesLieux['tri']
    readonly page: string
    readonly lignes: string
  }
}) => Promise<Lieux>

export type CommunesDesLieux = (options: {
  departementCode: CodeDepartement
}) => Promise<{ readonly communesOptions: readonly OptionDeCommune[] }>
