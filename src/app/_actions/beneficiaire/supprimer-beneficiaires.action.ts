'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import {
  SUPPRIMER_BENEFICIAIRES_ERRORS,
  SupprimerBeneficiairesValidation,
} from '@/features/beneficiaire/abilities/supprimer-beneficiaires'
import { supprimerBeneficiaires } from '@/features/beneficiaire/abilities/supprimer-beneficiaires/implementations'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

export const supprimerBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(SupprimerBeneficiairesValidation))
  .execute(
    fromResult(
      async ({ input, mediateur }) =>
        supprimerBeneficiaires({
          ids: input.ids,
          mediateurId: MediateurId(mediateur.id),
        }),
      { onError: SUPPRIMER_BENEFICIAIRES_ERRORS },
    ),
  )
