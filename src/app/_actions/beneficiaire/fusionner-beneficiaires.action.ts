'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { FUSIONNER_BENEFICIAIRES_ERRORS } from '@/features/beneficiaire/abilities/fusionner-beneficiaires/action/fusionner-beneficiaires.errors'
import { FusionnerBeneficiairesValidation } from '@/features/beneficiaire/abilities/fusionner-beneficiaires/action/fusionner-beneficiaires.validation'
import { fusionnerBeneficiaires } from '@/features/beneficiaire/abilities/fusionner-beneficiaires/implementations/prisma/index'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
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
