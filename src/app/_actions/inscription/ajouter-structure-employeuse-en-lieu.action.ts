'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { consulterEmployeuseActuelle } from '@/features/employeuse/abilities/consulter-employeuse-actuelle/implementations'
import {
  AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS,
  StructureEmployeuseLieuValidation,
} from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu'
import { ajouterStructureEmployeuseEnLieu } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/commands/ajouter-structure-employeuse-en-lieu'
import { geocoderLAdresse } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/implementations'
import { UserId } from '@/features/inscription/domain'
import {
  detacherDuLieuDecrit,
  rattacherAuLieuDecrit,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

export const ajouterStructureEmployeuseEnLieuAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(StructureEmployeuseLieuValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        ajouterStructureEmployeuseEnLieu(
          {
            userId: UserId(user.id),
            estLieuActivite: input.estLieuActivite,
          },
          {
            geocoderLAdresse,
            consulterEmployeuseActuelle,
            rattacherAuLieuDecrit,
            detacherDuLieuDecrit,
          },
        ),
      { onError: AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS },
    ),
  )
