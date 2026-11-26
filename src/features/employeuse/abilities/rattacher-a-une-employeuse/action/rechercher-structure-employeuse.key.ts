import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { StructureTrouvee } from '../domain/structure-trouvee'

export const RECHERCHER_STRUCTURE_EMPLOYEUSE_ACTION_KEY = keyFor<
  (input: { query: string }) => Promise<
    ServerActionResult<
      {
        readonly structures: StructureTrouvee[]
        readonly apiUnavailable: boolean
      },
      string
    >
  >
>('rechercher-structure-employeuse.action')
