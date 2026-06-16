'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { CreerBeneficiaireValidation } from '@app/web/features/beneficiaire/abilities/creer-beneficiaire'
import { creerBeneficiaire } from '@app/web/features/beneficiaire/abilities/creer-beneficiaire/implementation'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

export const creerBeneficiaireAction = actionBuilder()
  .use(withAuth())
  .use(withMediateur())
  .use(withInput(CreerBeneficiaireValidation))
  .execute(async ({ input, mediateur }) =>
    creerBeneficiaire({
      beneficiaire: input,
      mediateurId: MediateurId(mediateur.id),
    }),
  )
