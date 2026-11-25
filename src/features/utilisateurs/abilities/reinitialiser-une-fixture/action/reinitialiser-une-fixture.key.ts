import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { ReinitialiserUneFixtureValidation } from './reinitialiser-une-fixture.validation'

export const REINITIALISER_UNE_FIXTURE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ReinitialiserUneFixtureValidation>,
  ) => Promise<ServerActionResult<{ readonly nom: string }, string>>
>('reinitialiser-une-fixture.action')
