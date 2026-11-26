'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { CreerBeneficiaireValidation } from '@/features/beneficiaire/abilities/creer-beneficiaire/action/creer-beneficiaire.validation'
import { creerBeneficiaire } from '@/features/beneficiaire/abilities/creer-beneficiaire/domain/creer-beneficiaire'
import { enregistrerLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-beneficiaire/implementations/prisma/creer-beneficiaire.mutation'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

export const creerBeneficiaireAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(CreerBeneficiaireValidation))
  .execute(
    fromResult(
      async ({ input, mediateur }) =>
        creerBeneficiaire({ enregistrerLeBeneficiaire })({
          beneficiaire: input,
          beneficiaireId: BeneficiaireId(crypto.randomUUID()),
          mediateurId: MediateurId(mediateur.id),
          maintenant: new Date(),
        }),
      { onError: {} },
    ),
  )
