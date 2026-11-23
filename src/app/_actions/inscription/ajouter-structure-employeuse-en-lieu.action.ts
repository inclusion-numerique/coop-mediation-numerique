'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { consulterEmployeuseActuelle } from '@/features/employeuse/abilities/consulter-employeuse-actuelle/implementations/prisma/consulter-employeuse-actuelle.query'
import { AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/action/ajouter-structure-employeuse-en-lieu.errors'
import { StructureEmployeuseLieuValidation } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/action/ajouter-structure-employeuse-en-lieu.validation'
import { ajouterStructureEmployeuseEnLieu } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/commands/ajouter-structure-employeuse-en-lieu'
import { geocoderLAdresse } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/implementations/geocoder-l-adresse'
import { UserId } from '@/features/inscription/domain'
import {
  detacherDuLieuDecrit,
  rattacherAuLieuDecrit,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/rattacher-au-lieu-decrit'
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
