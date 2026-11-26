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
import { UtilisateurId as UtilisateurIdDeLEmployeuse } from '@/features/employeuse/domain'
import type { IdentiteEmployeuse } from '@/features/employeuse/domain/identite-employeuse'
import { RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS } from '@/features/inscription/abilities/renseigner-structure-employeuse/action/renseigner-structure-employeuse.errors'
import { renseignerStructureEmployeuse } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/renseigner-structure-employeuse'
import { projeterEtapeFranchie } from '@/features/inscription/abilities/renseigner-structure-employeuse/implementations/prisma/projeter-etape-franchie.mutation'
import { UtilisateurId } from '@/features/inscription/domain'
import { getInscriptionEtat } from '@/features/inscription/implementations/prisma/get-inscription-etat.query'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const rattacherAUneEmployeuseSaisie = rattacherAUneEmployeuse({
  lireLEtablissement: etablissementDepuisSiret,
  lireLeStatutDeConseillerNumerique: statutDeConseillerNumerique,
  lireLesEmployeusesDuSiret,
  creerLEmployeuse: creerLEmployeuse({ geocoder }),
  enregistrerLeRattachement: enregistrerLeRattachement({
    garantirLaPersonne: ensurePersonneMain,
    synchroniserLaPersonne: synchroniserPersonne,
  }),
})

const renseigner = renseignerStructureEmployeuse({
  lireLEtat: getInscriptionEtat,
  rattacherEmployeuse: ({
    userId,
    employeuse,
  }: {
    readonly userId: UtilisateurId
    readonly employeuse: IdentiteEmployeuse | null
  }) =>
    rattacherAUneEmployeuseSaisie({
      userId: UtilisateurIdDeLEmployeuse(userId),
      source: { _tag: 'Saisie', identite: employeuse },
    }),
  projeterEtapeFranchie,
})

export const renseignerStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(RenseignerStructureEmployeuseValidation))
  .execute(
    fromResult(
      async ({ input, user }) => {
        const resultat = await renseigner({
          command: {
            userId: UtilisateurId(user.id),
            employeuse: identiteSaisie(input.structure),
          },
          maintenant: new Date(),
        })

        return resultat.success ? success({ rattachee: true }) : resultat
      },
      { onError: RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS },
    ),
  )
