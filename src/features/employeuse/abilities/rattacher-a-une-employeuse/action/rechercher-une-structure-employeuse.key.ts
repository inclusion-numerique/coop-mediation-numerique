import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { TypologieStructure } from '../../../domain/typologie-de-structure'

export type StructureTrouvee = {
  readonly id?: string | null
  readonly nom: string
  readonly adresse: string
  readonly codePostal: string
  readonly commune: string
  readonly codeInsee: string
  readonly siret: string
  readonly typologie?: TypologieStructure | null
  readonly source: 'database' | 'api'
}

export const RECHERCHER_UNE_STRUCTURE_EMPLOYEUSE_ACTION_KEY = keyFor<
  (input: { query: string }) => Promise<
    ServerActionResult<
      {
        readonly structures: readonly StructureTrouvee[]
        readonly apiUnavailable: boolean
      },
      string
    >
  >
>('rechercher-une-structure-employeuse.action')
