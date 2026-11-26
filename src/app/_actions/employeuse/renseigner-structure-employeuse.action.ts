'use server'

import { geocoder } from '@/configuration/ban'
import { actionBuilder } from '@/configuration/nextjs'
import { signaler } from '@/configuration/telemetry/serveur'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RenseignerStructureEmployeuseValidation } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/renseigner-structure-employeuse.validation'
import { saisieEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/saisie-employeuse.transfer'
import { rattacherAUneEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/rattacher-a-une-employeuse'
import { etablissementDepuisSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/api-entreprise/etablissement-depuis-siret.query'
import { estConseillerNumeriqueEnPoste } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/conseiller-numerique-en-poste.query'
import { creerLEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/creer-l-employeuse.mutation'
import { lireLesEmployeusesDuSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/employeuses-du-siret.query'
import { enregistrerLeRattachement } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/enregistrer-le-rattachement.mutation'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { withInput } from '@/libraries/nextjs'

const rattacher = rattacherAUneEmployeuse({
  lireLEtablissement: etablissementDepuisSiret,
  estConseillerNumeriqueEnPoste,
  lireLesEmployeusesDuSiret: lireLesEmployeusesDuSiret(signaler),
  creerLEmployeuse: creerLEmployeuse({ geocoder, signaler }),
  enregistrerLeRattachement: enregistrerLeRattachement({
    garantirLaPersonne: ensurePersonneMain,
    synchroniserLaPersonne: synchroniserPersonne,
  }),
})

export const renseignerStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(RenseignerStructureEmployeuseValidation))
  .execute(async ({ input: { structure }, user }) => {
    const rattachement = await rattacher({
      userId: user.id,
      source: { _tag: 'Saisie', saisie: saisieEmployeuse(structure) },
    })

    return {
      rattachee: rattachement.success && rattachement.data._tag === 'Rattachee',
    }
  })
