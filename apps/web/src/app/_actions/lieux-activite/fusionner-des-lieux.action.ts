'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { fusionnerDesLieux } from '@app/web/features/lieux-activite'
import { FusionnerDesLieuxValidation } from '@app/web/features/lieux-activite/abilities/fusionner-des-lieux/action/fusionner-des-lieux.validation'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

/**
 * Fusionner deux lieux est un acte de modération : la source disparaît, et rien
 * ne la ramène. D'où la garde d'administration, ici et pas dans l'ability — les
 * deux jobs de déduplication appellent la même fusion sans utilisateur.
 */
export const fusionnerDesLieuxAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(FusionnerDesLieuxValidation))
  .execute(async ({ input }) =>
    fusionnerDesLieux(input.sourceStructureId, input.targetStructureId),
  )
