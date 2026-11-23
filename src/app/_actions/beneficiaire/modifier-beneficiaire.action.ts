'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth, withMediateur } from '@/features/authentification'
import {
  MODIFIER_BENEFICIAIRE_ERRORS,
  ModifierBeneficiaireValidation,
} from '@/features/beneficiaire/abilities/modifier-beneficiaire'
import { modifierBeneficiaire } from '@/features/beneficiaire/abilities/modifier-beneficiaire/implementations'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@/features/maintenance-mode'
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
          beneficiaire: input,
          mediateurId: MediateurId(mediateur.id),
        }),
      { onError: MODIFIER_BENEFICIAIRE_ERRORS },
    ),
  )
