'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  IdentiteEmployeuse,
  rattacherAUneEmployeuse,
} from '@app/web/features/employeuse'
import { RenseignerStructureEmployeuseValidation } from '@app/web/features/inscription/use-cases/renseigner-structure-employeuse/renseigner-structure-employeuse.validation'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Étape d'inscription « ma structure employeuse ».
 *
 * Le rattachement lui-même appartient à la feature employeuse ; l'inscription
 * n'ajoute que ce qui la concerne — l'horodatage de l'étape franchie, qui
 * conditionne la suite du parcours.
 *
 * L'utilisateur vient de la session, jamais de l'input : c'est ce qui remplace
 * la garde d'appartenance que portait la procédure tRPC.
 */
export const renseignerStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RenseignerStructureEmployeuseValidation))
  .execute(async ({ input: { structure }, user }) => {
    const rattachement = await rattacherAUneEmployeuse({
      userId: user.id,
      identite: IdentiteEmployeuse({
        siret: structure.siret,
        denomination: structure.nom,
        adresse: {
          voie: structure.adresse,
          commune: structure.commune,
          codePostal: structure.codePostal || null,
          codeInsee: structure.codeInsee || null,
        },
      }),
    })

    // L'étape n'est franchie que si le rattachement a abouti : l'horodater alors
    // que l'utilisateur n'a aucune employeuse le renverrait indéfiniment sur
    // cette même étape, avec une inscription qui se croit avancée.
    if (rattachement._tag !== 'rattachee') {
      return { rattachee: false as const }
    }

    await prismaClient.user.update({
      where: { id: user.id },
      data: { structureEmployeuseRenseignee: new Date() },
      select: { id: true },
    })

    return { rattachee: true as const }
  })
