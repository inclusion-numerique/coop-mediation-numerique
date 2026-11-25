import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY = keyFor<
  (input: {
    query: string
    excludeIds?: string[]
  }) => Promise<
    ServerActionResult<
      { readonly beneficiaires: readonly BeneficiaireTrouveParLeCra[] },
      string
    >
  >
>('activites.rechercher-des-beneficiaires')

export type BeneficiaireTrouveParLeCra = {
  readonly id: string
  readonly prenom: string
  readonly nom: string
  readonly communeResidence: CommuneConnue | null
}

export type CommuneConnue = {
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string
}
