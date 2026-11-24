'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RENSEIGNER_LIEUX_ACTIVITE_ERRORS } from '@/features/inscription/abilities/renseigner-lieux-activite/action/renseigner-lieux-activite.errors'
import { RenseignerLieuxActiviteValidation } from '@/features/inscription/abilities/renseigner-lieux-activite/action/renseigner-lieux-activite.validation'
import { depuisLaSaisie } from '@/features/inscription/abilities/renseigner-lieux-activite/action/saisie-des-lieux.transfer'
import type {
  AdresseNonValidee,
  RenseignerLieuxActiviteError,
} from '@/features/inscription/abilities/renseigner-lieux-activite/domain'
import { renseignerLieuxActiviteAvec } from '@/features/inscription/abilities/renseigner-lieux-activite/implementations/renseigner-lieux-activite.binding'
import { UtilisateurId } from '@/features/inscription/domain'
import { structuresCartoParIds } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/entrepot/structures-carto.query'
import { activitesEnCoursDeLUtilisateur } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/activites-en-cours.query'
import { rattacherAuLieuDesire } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/rattacher-au-lieu-desire.mutation'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'
import type { Result } from '@/libraries/result'

export const renseignerLieuxActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(RenseignerLieuxActiviteValidation))
  .execute(
    fromResult(
      async ({
        user,
        input,
      }): Promise<
        Result<void, RenseignerLieuxActiviteError | AdresseNonValidee>
      > => {
        const lieuxActivite = depuisLaSaisie(input.lieux)

        if (!lieuxActivite.success) return lieuxActivite

        return renseignerLieuxActiviteAvec({
          trouverStructuresCarto: structuresCartoParIds,
          lireLieuxActiviteExistants: activitesEnCoursDeLUtilisateur,
          rattacherAuLieuDesire,
        })({
          command: {
            userId: UtilisateurId(user.id),
            lieuxActivite: lieuxActivite.data,
          },
          maintenant: new Date(),
        })
      },
      { onError: RENSEIGNER_LIEUX_ACTIVITE_ERRORS },
    ),
  )
