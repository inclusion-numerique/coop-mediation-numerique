'use server'

import { geocoder } from '@/configuration/ban'
import { actionBuilder } from '@/configuration/nextjs'
import { signaler } from '@/configuration/telemetry/serveur'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RenseignerStructureEmployeuseValidation } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/employeuse-choisie'
import { rattacherUneSaisie } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/rattacher-une-saisie'
import { etablissementDepuisSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/api-entreprise/etablissement-depuis-siret.query'
import type { RegistreDesPersonnes } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/rattacher-a-une-employeuse.mutation'
import { rattacherAUneEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/rattacher-a-une-employeuse.mutation'
import { RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS } from '@/features/inscription/abilities/renseigner-structure-employeuse/action/renseigner-structure-employeuse.errors'
import type { RattacherEmployeuse } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain/ports'
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

const renseignerStructureEmployeuseAvec = (
  rattacherEmployeuse: RattacherEmployeuse,
) =>
  renseignerStructureEmployeuse({
    lireLEtat: getInscriptionEtat,
    rattacherEmployeuse,
    projeterEtapeFranchie,
  })

const services = {
  geocoder,
  signaler,
  etablissementDepuisSiret,
}

const rattacherAUneEmployeuseAvec = (registre: RegistreDesPersonnes) =>
  rattacherAUneEmployeuse({ ...services, ...registre })

const rattacherUneSaisieAvec = (registre: RegistreDesPersonnes) =>
  rattacherUneSaisie(rattacherAUneEmployeuseAvec(registre))

const registreDesPersonnes = {
  garantirLaPersonne: ensurePersonneMain,
  synchroniserLaPersonne: synchroniserPersonne,
}

/**
 * Étape d'inscription « ma structure employeuse ».
 *
 * Le rattachement lui-même appartient à la feature employeuse, atteinte par le
 * port `rattacherEmployeuse` ; l'inscription n'ajoute que ce qui la concerne —
 * l'horodatage de l'étape franchie, qui conditionne la suite du parcours.
 *
 * L'utilisateur vient de la session, jamais de l'input : c'est ce qui remplace
 * la garde d'appartenance que portait la procédure tRPC.
 */
export const renseignerStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(RenseignerStructureEmployeuseValidation))
  .execute(
    fromResult(
      async ({ input, user }) => {
        const resultat = await renseignerStructureEmployeuseAvec(
          rattacherUneSaisieAvec(registreDesPersonnes),
        )({
          command: {
            userId: UtilisateurId(user.id),
            structureEmployeuse: input.structure,
          },
          maintenant: new Date(),
        })

        return resultat.success ? success({ rattachee: true }) : resultat
      },
      { onError: RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS },
    ),
  )
