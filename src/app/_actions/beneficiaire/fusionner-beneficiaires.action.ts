'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth, withMediateur } from '@/features/authentification'
import {
  FUSIONNER_BENEFICIAIRES_ERRORS,
  FusionnerBeneficiairesValidation,
} from '@/features/beneficiaire/abilities/fusionner-beneficiaires'
import { fusionnerBeneficiaires } from '@/features/beneficiaire/abilities/fusionner-beneficiaires/implementation'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@/features/maintenance-mode'
import { ServerActionError, withInput } from '@/libraries/nextjs'

export const fusionnerBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(FusionnerBeneficiairesValidation))
  .execute(async ({ input: { fusions }, mediateur }) => {
    const mediateurId = MediateurId(mediateur.id)
    const results = await Promise.all(
      fusions.map((fusion) =>
        fusionnerBeneficiaires({ ...fusion, mediateurId }),
      ),
    )

    const firstError = results.find((result) => !result.success)

    return firstError && !firstError.success
      ? ServerActionError(FUSIONNER_BENEFICIAIRES_ERRORS[firstError.error._tag])
      : results
          .filter((r) => r.success)
          .map((r) => r.data.beneficiaireFusionneId)
  })
