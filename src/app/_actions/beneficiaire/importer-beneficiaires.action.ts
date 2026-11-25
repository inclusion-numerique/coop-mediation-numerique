'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { ImporterBeneficiairesValidation } from '@/features/beneficiaire/abilities/importer-beneficiaires/action/importer-beneficiaires.validation'
import { importerBeneficiaires } from '@/features/beneficiaire/abilities/importer-beneficiaires/implementations/prisma/importer-beneficiaires.mutation'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { withInput } from '@/libraries/nextjs'

export const importerBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(ImporterBeneficiairesValidation))
  .execute(async ({ input, mediateur }) =>
    importerBeneficiaires({
      beneficiaires: input.beneficiaires,
      mediateurId: MediateurId(mediateur.id),
    }),
  )
