'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  RenseignerStructureEmployeuseValidation,
  renseignerStructureEmployeuse,
} from '@app/web/features/inscription/abilities/renseigner-structure-employeuse'
import {
  ensureStructureEmployeuse,
  lierEmploi,
} from '@app/web/features/inscription/abilities/renseigner-structure-employeuse/implementation'
import { UserId } from '@app/web/features/inscription/domain'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

export const renseignerStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RenseignerStructureEmployeuseValidation))
  .execute(async ({ input, user }) =>
    renseignerStructureEmployeuse({ ensureStructureEmployeuse, lierEmploi })({
      userId: UserId(user.id),
      structureEmployeuse: input.structureEmployeuse,
    }),
  )
