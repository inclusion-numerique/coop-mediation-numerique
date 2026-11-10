import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { AccompagnementEnregistre } from '../domain'
import type { EnregistrerUnAccompagnementIndividuelValidation } from './enregistrer-un-accompagnement-individuel.validation'

export const ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ACTION_KEY = keyFor<
  (
    input: z.input<typeof EnregistrerUnAccompagnementIndividuelValidation>,
  ) => Promise<ServerActionResult<AccompagnementEnregistre, string>>
>('enregistrer-un-accompagnement-individuel.action')
