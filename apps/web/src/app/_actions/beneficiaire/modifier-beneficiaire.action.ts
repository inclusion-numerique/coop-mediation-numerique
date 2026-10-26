'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import {
  MODIFIER_BENEFICIAIRE_ERRORS,
  ModifierBeneficiaireValidation,
} from '@app/web/features/beneficiaire/abilities/modifier-beneficiaire'
import { modifierBeneficiaire } from '@app/web/features/beneficiaire/abilities/modifier-beneficiaire/implementation'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const modifierBeneficiaireAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(ModifierBeneficiaireValidation))
  .execute(
    fromResult(
      async ({ input, mediateur }) =>
        modifierBeneficiaire({
          beneficiaire: input,
          mediateurId: MediateurId(mediateur.id),
        }),
      { onError: MODIFIER_BENEFICIAIRE_ERRORS },
    ),
  )
