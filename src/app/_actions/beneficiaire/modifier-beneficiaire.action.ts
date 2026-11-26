'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { MODIFIER_BENEFICIAIRE_ERRORS } from '@/features/beneficiaire/abilities/modifier-beneficiaire/action/modifier-beneficiaire.errors'
import { ModifierBeneficiaireValidation } from '@/features/beneficiaire/abilities/modifier-beneficiaire/action/modifier-beneficiaire.validation'
import { modifierBeneficiaire } from '@/features/beneficiaire/abilities/modifier-beneficiaire/domain/modifier-beneficiaire'
import { creationDuBeneficiaire } from '@/features/beneficiaire/abilities/modifier-beneficiaire/implementations/prisma/creation-du-beneficiaire.query'
import { enregistrerLaModification } from '@/features/beneficiaire/abilities/modifier-beneficiaire/implementations/prisma/enregistrer-la-modification.mutation'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

export const modifierBeneficiaireAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(ModifierBeneficiaireValidation))
  .execute(
    fromResult(
      async ({ input, mediateur }) =>
        modifierBeneficiaire({
          creationDuBeneficiaire,
          enregistrerLaModification,
        })({
          beneficiaire: input,
          mediateurId: MediateurId(mediateur.id),
          maintenant: new Date(),
        }),
      { onError: MODIFIER_BENEFICIAIRE_ERRORS },
    ),
  )
