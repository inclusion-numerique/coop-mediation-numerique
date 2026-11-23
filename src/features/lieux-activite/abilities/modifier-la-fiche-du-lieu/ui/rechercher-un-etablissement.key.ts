import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export type EtablissementTrouve = {
  readonly nom: string
  readonly siret: string
  readonly adresse: string
  readonly codePostal: string
  readonly commune: string
  readonly codeInsee: string
}

export const RECHERCHER_UN_ETABLISSEMENT_KEY = keyFor<
  (input: {
    query: string
  }) => Promise<
    ServerActionResult<{ readonly structures: readonly EtablissementTrouve[] }>
  >
>('lieux-activite.rechercher-un-etablissement')
