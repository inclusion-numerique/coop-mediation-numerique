'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { SupprimerBeneficiairesValidation } from '@app/web/features/beneficiaire/abilities/supprimer-beneficiaires'
import { supprimerBeneficiaires } from '@app/web/features/beneficiaire/abilities/supprimer-beneficiaires/implementation'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

const SUPPRIMER_BENEFICIAIRES_ERRORS = {
  AucunBeneficiaireValide: 'Aucun bénéficiaire valide',
} as const

export const supprimerBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withMediateur())
  .use(withInput(SupprimerBeneficiairesValidation))
  .execute(
    fromResult(async ({ input }) => supprimerBeneficiaires(input), {
      onError: SUPPRIMER_BENEFICIAIRES_ERRORS,
    }),
  )
