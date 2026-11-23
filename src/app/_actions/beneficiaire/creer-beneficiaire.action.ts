'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { CreerBeneficiaireValidation } from '@/features/beneficiaire/abilities/creer-beneficiaire'
import { creerBeneficiaire } from '@/features/beneficiaire/abilities/creer-beneficiaire/implementations'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { withInput } from '@/libraries/nextjs'

export const creerBeneficiaireAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(CreerBeneficiaireValidation))
  .execute(async ({ input, mediateur }) =>
    creerBeneficiaire({
      beneficiaire: input,
      mediateurId: MediateurId(mediateur.id),
    }),
  )
