'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS,
  StructureEmployeuseLieuValidation,
} from '@app/web/features/inscription/abilities/ajouter-structure-employeuse-en-lieu'
import { ajouterStructureEmployeuseEnLieu } from '@app/web/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/commands/ajouter-structure-employeuse-en-lieu'
import { UserId } from '@app/web/features/inscription/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const ajouterStructureEmployeuseEnLieuAction = actionBuilder()
  .use(withAuth())
  .use(withInput(StructureEmployeuseLieuValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        ajouterStructureEmployeuseEnLieu({
          userId: UserId(user.id),
          estLieuActivite: input.estLieuActivite,
        }),
      { onError: AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS },
    ),
  )
