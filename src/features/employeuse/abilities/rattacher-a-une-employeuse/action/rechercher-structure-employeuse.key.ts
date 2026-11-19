import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { StructureSearchResult } from '../domain/employeuse-choisie'

export const RECHERCHER_STRUCTURE_EMPLOYEUSE_ACTION_KEY = keyFor<
  (input: { query: string }) => Promise<
    ServerActionResult<
      {
        readonly structures: StructureSearchResult[]
        readonly apiUnavailable: boolean
      },
      string
    >
  >
>('rechercher-structure-employeuse.action')
