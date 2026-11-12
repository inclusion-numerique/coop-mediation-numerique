import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { BeneficiaireTrouveParLeCra } from './beneficiaire-du-cra'

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
