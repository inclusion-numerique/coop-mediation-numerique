import type { Result } from '@/libraries/result'
import type { RechercherEmployeuse } from '../../../domain/ports'
import type { AnnuaireIndisponible } from './errors'

export type StructuresLues<Structure> = {
  readonly structures: readonly Structure[]
  readonly total: number
}

type LireLAnnuaireDesEntreprises<Etablissement> = (
  recherche: string,
) => Promise<Result<StructuresLues<Etablissement>, AnnuaireIndisponible>>

export type RechercherUneStructureEmployeusePorts<Etablissement> = {
  readonly lireLesStructuresDeLaCoop: RechercherEmployeuse
  readonly lireLAnnuaireDesEntreprises: LireLAnnuaireDesEntreprises<Etablissement>
}
