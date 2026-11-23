'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth, withMediateur } from '@/features/authentification'
import { RechercherBeneficiairesValidation } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/action/rechercher-beneficiaires.validation'
import { rechercherBeneficiaires } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/implementations/prisma/rechercher-beneficiaires.query'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { withInput } from '@/libraries/nextjs'

export const rechercherBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withMediateur())
  .use(withInput(RechercherBeneficiairesValidation))
  .execute(async ({ input, mediateur }) =>
    rechercherBeneficiaires({
      ...input,
      mediateurId: MediateurId(mediateur.id),
    }),
  )
