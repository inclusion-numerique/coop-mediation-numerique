'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import {
  SUPPRIMER_BENEFICIAIRES_ERRORS,
  SupprimerBeneficiairesValidation,
} from '@app/web/features/beneficiaire/abilities/supprimer-beneficiaires'
import { supprimerBeneficiaires } from '@app/web/features/beneficiaire/abilities/supprimer-beneficiaires/implementation'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

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
