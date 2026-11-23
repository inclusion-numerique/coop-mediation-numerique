'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth, withMediateur } from '@/features/authentification'
import { ImporterBeneficiairesValidation } from '@/features/beneficiaire/abilities/importer-beneficiaires'
import { importerBeneficiaires } from '@/features/beneficiaire/abilities/importer-beneficiaires/implementations'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@/features/maintenance-mode'
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
