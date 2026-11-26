'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { FUSIONNER_DES_LIEUX_ERRORS } from '@/features/lieux-activite/abilities/fusionner-des-lieux/action/fusionner-des-lieux.errors'
import { FusionnerDesLieuxValidation } from '@/features/lieux-activite/abilities/fusionner-des-lieux/action/fusionner-des-lieux.validation'
import { fusionnerDesLieux } from '@/features/lieux-activite/abilities/fusionner-des-lieux/domain'
import { fusionnerLesLieux } from '@/features/lieux-activite/abilities/fusionner-des-lieux/implementations/prisma/fusionner-des-lieux.mutation'
import { lieuxExistants } from '@/features/lieux-activite/abilities/fusionner-des-lieux/implementations/prisma/lieux-existants.query'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { fromResult, withInput } from '@/libraries/nextjs'

/**
 * Fusionner deux lieux est un acte de modération : la source disparaît, et rien
 * ne la ramène. D'où la garde d'administration, posée ici plutôt que dans
 * l'ability — c'est l'écran qui est réservé, pas l'écriture.
 */
export const fusionnerDesLieuxAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(FusionnerDesLieuxValidation))
  .execute(
    fromResult(
      async ({ input }) =>
        fusionnerDesLieux({ lieuxExistants, fusionner: fusionnerLesLieux })({
          source: LieuId(input.sourceStructureId),
          cible: LieuId(input.targetStructureId),
        }),
      { onError: FUSIONNER_DES_LIEUX_ERRORS },
    ),
  )
