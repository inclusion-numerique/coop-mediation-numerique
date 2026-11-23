'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import {
  identiteDeLEmployeuseChoisie,
  RenseignerStructureEmployeuseValidation,
} from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/employeuse-choisie'
import { rattacherAUneEmployeuseBinding } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/rattacher-a-une-employeuse.binding'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { withInput } from '@/libraries/nextjs'

const registreDesPersonnes = {
  garantirLaPersonne: ensurePersonneMain,
  synchroniserLaPersonne: synchroniserPersonne,
}

export const renseignerStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(RenseignerStructureEmployeuseValidation))
  .execute(async ({ input: { structure }, user }) => {
    const identite = identiteDeLEmployeuseChoisie(structure)

    if (!identite) return { rattachee: false }

    const rattachement = await rattacherAUneEmployeuseBinding(
      registreDesPersonnes,
    )({
      userId: user.id,
      identite,
    })

    return { rattachee: rattachement._tag === 'rattachee' }
  })
