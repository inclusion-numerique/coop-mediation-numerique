'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  EmployeuseId,
  StructureEmployeuseLieuValidation,
} from '@app/web/features/inscription/abilities/ajouter-structure-employeuse-en-lieu'
import { ajouterStructureEmployeuseEnLieu } from '@app/web/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/commands/ajouter-structure-employeuse-en-lieu'
import { UserId } from '@app/web/features/inscription/domain'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

export const ajouterStructureEmployeuseEnLieuAction = actionBuilder()
  .use(withAuth())
  .use(withInput(StructureEmployeuseLieuValidation))
  .execute(async ({ user, input }) => {
    await ajouterStructureEmployeuseEnLieu({
      userId: UserId(user.id),
      structureEmployeuseId: EmployeuseId(input.structureEmployeuseId),
      estLieuActivite: input.estLieuActivite,
    })
  })
