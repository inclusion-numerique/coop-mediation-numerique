'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherUneStructureEmployeuseValidation } from '@/features/employeuse/abilities/rechercher-une-structure-employeuse/action/rechercher-une-structure-employeuse.validation'
import { rechercherUneStructureEmployeuse } from '@/features/employeuse/abilities/rechercher-une-structure-employeuse/domain/rechercher-une-structure-employeuse'
import { lireLesStructuresDeLaCoop } from '@/features/employeuse/abilities/rechercher-une-structure-employeuse/implementations/prisma/structures-de-la-coop.query'
import { lireLAnnuaireDesEntreprises } from '@/features/employeuse/abilities/rechercher-une-structure-employeuse/implementations/recherche-entreprises/annuaire-des-entreprises.query'
import { withInput } from '@/libraries/nextjs'

export const rechercherStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherUneStructureEmployeuseValidation))
  .execute(async ({ input: { query } }) => {
    const { data } = await rechercherUneStructureEmployeuse({
      lireLesStructuresDeLaCoop,
      lireLAnnuaireDesEntreprises,
    })({ recherche: query })

    return data
  })
