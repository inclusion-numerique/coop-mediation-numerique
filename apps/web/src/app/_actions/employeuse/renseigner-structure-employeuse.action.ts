'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  identiteDeLEmployeuseChoisie,
  RenseignerStructureEmployeuseValidation,
} from '@app/web/features/employeuse/abilities/rattacher-a-une-employeuse/domain/employeuse-choisie'
import { rattacherAUneEmployeuseBinding } from '@app/web/features/employeuse/server'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

export const renseignerStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(RenseignerStructureEmployeuseValidation))
  .execute(async ({ input: { structure }, user }) => {
    const identite = identiteDeLEmployeuseChoisie(structure)

    if (!identite) return { rattachee: false }

    const rattachement = await rattacherAUneEmployeuseBinding({
      userId: user.id,
      identite,
    })

    return { rattachee: rattachement._tag === 'rattachee' }
  })
