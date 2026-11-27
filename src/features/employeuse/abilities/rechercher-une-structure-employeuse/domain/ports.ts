import type { Result } from '@/libraries/result'
import type { AnnuaireIndisponible } from './errors'

export type StructuresLues<Structure> = {
  readonly structures: readonly Structure[]
  readonly total: number
}

export type LireLesStructuresDeLaCoop<Structure> = (entree: {
  readonly recherche: string
  readonly limite: number
}) => Promise<StructuresLues<Structure>>

export type LireLAnnuaireDesEntreprises<Structure> = (
  recherche: string,
) => Promise<Result<StructuresLues<Structure>, AnnuaireIndisponible>>

export type RechercherUneStructureEmployeusePorts<Coop, Annuaire> = {
  readonly lireLesStructuresDeLaCoop: LireLesStructuresDeLaCoop<Coop>
  readonly lireLAnnuaireDesEntreprises: LireLAnnuaireDesEntreprises<Annuaire>
}
