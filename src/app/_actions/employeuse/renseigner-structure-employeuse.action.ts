'use server'

import { geocoder } from '@/configuration/ban'
import { actionBuilder } from '@/configuration/nextjs'
import { signaler } from '@/configuration/telemetry/serveur'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import {
  identiteDeLEmployeuseChoisie,
  RenseignerStructureEmployeuseValidation,
} from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/employeuse-choisie'
import { etablissementDepuisSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/api-entreprise/etablissement-depuis-siret.query'
import type { RegistreDesPersonnes } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/rattacher-a-une-employeuse.mutation'
import { rattacherAUneEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/rattacher-a-une-employeuse.mutation'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { withInput } from '@/libraries/nextjs'

const services = {
  geocoder,
  signaler,
  etablissementDepuisSiret,
}

const rattacherAUneEmployeuseAvec = (registre: RegistreDesPersonnes) =>
  rattacherAUneEmployeuse({ ...services, ...registre })

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

    const rattachement = await rattacherAUneEmployeuseAvec(
      registreDesPersonnes,
    )({
      userId: user.id,
      identite,
    })

    return { rattachee: rattachement._tag === 'rattachee' }
  })
