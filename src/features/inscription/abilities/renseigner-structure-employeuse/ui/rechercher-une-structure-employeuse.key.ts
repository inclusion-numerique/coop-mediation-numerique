import type { TypologieStructure } from '@/features/employeuse/domain/typologieStructure'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export type StructureEmployeuseTrouvee = {
  readonly id?: string | null
  readonly nom: string
  readonly siret: string
  readonly adresse: string
  readonly codePostal: string
  readonly commune: string
  readonly codeInsee: string
  readonly typologie?: TypologieStructure | null
}

export const RECHERCHER_UNE_STRUCTURE_EMPLOYEUSE_KEY = keyFor<
  (input: { query: string }) => Promise<
    ServerActionResult<{
      readonly structures: readonly StructureEmployeuseTrouvee[]
      readonly apiUnavailable: boolean
    }>
  >
>('inscription.rechercher-une-structure-employeuse')
