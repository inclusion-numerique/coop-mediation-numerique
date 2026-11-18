'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import {
  identiteDeLEmployeuseChoisie,
  RenseignerStructureEmployeuseValidation,
} from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/employeuse-choisie'
import { rattacherAUneEmployeuseBinding } from '@/features/employeuse/server'
import { withMaintenance } from '@/features/maintenance-mode'
import { withInput } from '@/libraries/nextjs'

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
