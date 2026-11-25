import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const FUSIONNER_DES_BENEFICIAIRES_KEY = keyFor<
  (input: {
    fusions: { sourceId: string; destinationId: string }[]
  }) => Promise<ServerActionResult<unknown, string>>
>('detecter-doublons.fusionner-des-beneficiaires')
