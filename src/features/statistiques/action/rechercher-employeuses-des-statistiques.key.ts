import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export type StructureEmployeuseOption = {
  id: string
  nom: string
  commune: string | null
}

export const RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY = keyFor<
  (input: {
    recherche: string
    exclues: string[]
  }) => Promise<
    ServerActionResult<readonly StructureEmployeuseOption[], string>
  >
>('rechercher-employeuses-des-activites.action')
