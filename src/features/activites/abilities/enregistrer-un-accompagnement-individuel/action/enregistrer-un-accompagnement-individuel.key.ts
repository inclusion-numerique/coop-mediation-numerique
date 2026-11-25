import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { AccompagnementEnregistre } from '../domain'
import type { EnregistrerUnAccompagnementIndividuelValidation } from './enregistrer-un-accompagnement-individuel.validation'

export const ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ACTION_KEY = keyFor<
  (
    input: z.input<typeof EnregistrerUnAccompagnementIndividuelValidation>,
  ) => Promise<ServerActionResult<AccompagnementEnregistre, string>>
>('enregistrer-un-accompagnement-individuel.action')
