import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libs/injection/client'
import type { ReinitialiserUneFixtureValidation } from './reinitialiser-une-fixture.validation'

export const REINITIALISER_UNE_FIXTURE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ReinitialiserUneFixtureValidation>,
  ) => Promise<ServerActionResult<{ readonly nom: string }, string>>
>('reinitialiser-une-fixture.action')
