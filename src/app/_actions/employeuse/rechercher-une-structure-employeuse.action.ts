'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherUneStructureEmployeuseValidation } from '@/features/employeuse/abilities/rechercher-une-structure-employeuse/action/rechercher-une-structure-employeuse.validation'
import { rechercherUneStructureEmployeuse } from '@/features/employeuse/abilities/rechercher-une-structure-employeuse/domain/rechercher-une-structure-employeuse'
import { lireLAnnuaireDesEntreprises } from '@/features/employeuse/abilities/rechercher-une-structure-employeuse/implementations/recherche-entreprises/annuaire-des-entreprises.query'
import { structuresTrouveesAffichees } from '@/features/employeuse/abilities/rechercher-une-structure-employeuse/ui/presenters/structures-trouvees.presenter'
import { rechercherEmployeuse } from '@/features/employeuse/implementations/prisma/rechercher-employeuse.query'
import { withInput } from '@/libraries/nextjs'

export const rechercherUneStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherUneStructureEmployeuseValidation))
  .execute(async ({ input: { query } }) => {
    const { data } = await rechercherUneStructureEmployeuse({
      lireLesStructuresDeLaCoop: rechercherEmployeuse,
      lireLAnnuaireDesEntreprises,
    })({ recherche: query })

    return structuresTrouveesAffichees(data)
  })
