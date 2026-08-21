'use server'

import { withAuth } from '@app/web/features/authentification'
import { RenseignerStructureEmployeuseValidation } from '@app/web/features/employeuse/abilities/rattacher-a-une-employeuse/domain/employeuse-choisie'
import {
  IdentiteEmployeuse,
  rattacherAUneEmployeuse,
} from '@app/web/features/employeuse/server'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { prismaClient } from '@app/web/prismaClient'

/**
 * « Renseigner ma structure employeuse » : l'étape d'inscription, et la même
 * demande faite plus tard à qui n'en a plus (garde de la saisie d'un CRA).
 *
 * L'horodatage de l'étape reste posé dans les deux cas : c'est la date à
 * laquelle la personne a déclaré son employeuse, et la reposer pour quelqu'un
 * de déjà inscrit ne franchit rien qui ne le soit.
 *
 * L'utilisateur vient de la session, jamais de l'input : c'est ce qui remplace
 * la garde d'appartenance que portait la procédure tRPC.
 */
export const renseignerStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RenseignerStructureEmployeuseValidation))
  .execute(async ({ input: { structure }, user }) => {
    // Forme totale : une structure enregistrée sans adresse exploitable ne peut
    // pas devenir une employeuse — on le rapporte plutôt que de jeter.
    const identite = IdentiteEmployeuse.safe({
      siret: structure.siret,
      denomination: structure.nom,
      adresse: {
        voie: structure.adresse,
        commune: structure.commune,
        codePostal: structure.codePostal || null,
        codeInsee: structure.codeInsee || null,
      },
    })

    if (!identite) return { rattachee: false as const }

    const rattachement = await rattacherAUneEmployeuse({
      userId: user.id,
      identite,
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
