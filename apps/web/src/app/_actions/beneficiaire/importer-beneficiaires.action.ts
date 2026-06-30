'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { ImporterBeneficiairesValidation } from '@app/web/features/beneficiaire/abilities/importer-beneficiaires'
import { importerBeneficiaires } from '@app/web/features/beneficiaire/abilities/importer-beneficiaires/implementation'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

export const importerBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withMediateur())
  .use(withInput(ImporterBeneficiairesValidation))
  .execute(async ({ input, mediateur }) =>
    importerBeneficiaires({
      beneficiaires: input.beneficiaires,
      mediateurId: MediateurId(mediateur.id),
    }),
  )
