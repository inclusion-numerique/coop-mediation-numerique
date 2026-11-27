'use server'

import { geocoder } from '@/configuration/ban'
import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RenseignerStructureEmployeuseValidation } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/renseigner-structure-employeuse.validation'
import { identiteSaisie } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/saisie-employeuse.transfer'
import { rattacherAUneEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/rattacher-a-une-employeuse'
import { etablissementDepuisSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/api-entreprise/etablissement-depuis-siret.query'
import { statutDeConseillerNumerique } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/conseiller-numerique-en-poste.query'
import { creerLEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/creer-l-employeuse.mutation'
import { lireLesEmployeusesDuSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/employeuses-du-siret.query'
import { enregistrerLeRattachement } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/enregistrer-le-rattachement.mutation'
import { UtilisateurId } from '@/features/employeuse/domain'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { withInput } from '@/libraries/nextjs'

const rattacher = rattacherAUneEmployeuse({
  lireLEtablissement: etablissementDepuisSiret,
  lireLeStatutDeConseillerNumerique: statutDeConseillerNumerique,
  lireLesEmployeusesDuSiret,
  creerLEmployeuse: creerLEmployeuse({ geocoder }),
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
      userId: UtilisateurId(user.id),
      source: { _tag: 'Saisie', identite: identiteSaisie(structure) },
    })

    return {
      rattachee: rattachement.success && rattachement.data._tag === 'Rattachee',
    }
  })
