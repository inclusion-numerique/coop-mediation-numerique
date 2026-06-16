'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import {
  FUSIONNER_BENEFICIAIRES_ERRORS,
  FusionnerBeneficiairesValidation,
} from '@app/web/features/beneficiaire/abilities/fusionner-beneficiaires'
import { fusionnerBeneficiaires } from '@app/web/features/beneficiaire/abilities/fusionner-beneficiaires/implementation'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import {
  actionBuilder,
  ServerActionError,
  withInput,
} from '@app/web/libraries/nextjs'

export const fusionnerBeneficiairesAction = actionBuilder()
  .use(withAuth())
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
