'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import {
  RENSEIGNER_LIEUX_ACTIVITE_ERRORS,
  RenseignerLieuxActiviteValidation,
} from '@/features/inscription/abilities/renseigner-lieux-activite'
import { depuisLaSaisie } from '@/features/inscription/abilities/renseigner-lieux-activite/action/depuis-la-saisie'
import { renseignerLieuxActivite } from '@/features/inscription/abilities/renseigner-lieux-activite/commands/renseigner-lieux-activite'
import type {
  AdresseNonValidee,
  RenseignerLieuxActiviteError,
} from '@/features/inscription/abilities/renseigner-lieux-activite/domain'
import { UserId } from '@/features/inscription/domain'
import {
  activitesEnCoursDeLUtilisateur,
  rattacherAuLieuDesire,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite'
import { findCartoStructuresByIds } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/entrepot/structures-carto'
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

        return renseignerLieuxActivite({
          command: {
            userId: UserId(user.id),
            lieuxActivite: lieuxActivite.data,
          },
          trouverStructuresCarto: findCartoStructuresByIds,
          lireLieuxActiviteExistants: activitesEnCoursDeLUtilisateur,
          rattacherAuLieuDesire,
          maintenant: new Date(),
        })
      },
      { onError: RENSEIGNER_LIEUX_ACTIVITE_ERRORS },
    ),
  )
