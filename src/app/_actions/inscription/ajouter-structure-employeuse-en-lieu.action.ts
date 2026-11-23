'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { consulterEmployeuseActuelle } from '@/features/employeuse/server'
import {
  AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS,
  StructureEmployeuseLieuValidation,
} from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu'
import { ajouterStructureEmployeuseEnLieu } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/commands/ajouter-structure-employeuse-en-lieu'
import { geocoderLAdresse } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/implementation'
import { UserId } from '@/features/inscription/domain'
import {
  detacherDuLieuDecrit,
  rattacherAuLieuDecrit,
} from '@/features/lieux-activite'
import { withMaintenance } from '@/features/maintenance-mode'
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
