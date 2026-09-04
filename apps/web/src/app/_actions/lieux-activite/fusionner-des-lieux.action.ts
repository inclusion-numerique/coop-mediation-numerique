'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { fusionnerDesLieux } from '@app/web/features/lieux-activite/abilities/fusionner-des-lieux'
import { FusionnerDesLieuxValidation } from '@app/web/features/lieux-activite/abilities/fusionner-des-lieux/action/fusionner-des-lieux.validation'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

/**
 * Fusionner deux lieux est un acte de modération : la source disparaît, et rien
 * ne la ramène. D'où la garde d'administration, posée ici plutôt que dans
 * l'ability — c'est l'écran qui est réservé, pas l'écriture.
 */
export const fusionnerDesLieuxAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(FusionnerDesLieuxValidation))
  .execute(async ({ input }) =>
    fusionnerDesLieux(input.sourceStructureId, input.targetStructureId),
  )
