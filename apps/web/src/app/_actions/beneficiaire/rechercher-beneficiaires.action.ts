'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { RechercherBeneficiairesValidation } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/action/rechercher-beneficiaires.validation'
import { rechercherBeneficiaires } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/implementation/prisma/rechercher-beneficiaires.query'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

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
