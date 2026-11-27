'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherStructureEmployeuseValidation } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/rechercher-structure-employeuse.validation'
import { rechercheStructureEmployeuseAvec } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/recherche-entreprises/recherche-structure-employeuse.query'
import { rechercherEmployeuse } from '@/features/employeuse/implementations/prisma/rechercher-employeuse.query'
import { employeuseRecherchee } from '@/features/employeuse/ui/presenters/employeuse-recherchee.presenter'
import { withInput } from '@/libraries/nextjs'

export const rechercherStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherStructureEmployeuseValidation))
  .execute(async ({ input: { query } }) =>
    rechercheStructureEmployeuseAvec({
      employeuseRecherchee,
      rechercherEmployeuse,
    })(query),
  )
