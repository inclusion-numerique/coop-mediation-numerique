'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { RechercherBeneficiairesValidation } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/action/rechercher-beneficiaires.validation'
import { rechercherBeneficiaires } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/implementation/prisma/rechercher-beneficiaires.query'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

export const rechercherBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withMediateur())
  .use(withInput(RechercherBeneficiairesValidation))
  .execute(async ({ input }) => rechercherBeneficiaires(input))
