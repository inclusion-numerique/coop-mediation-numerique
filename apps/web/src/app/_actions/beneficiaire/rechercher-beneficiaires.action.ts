'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { rechercherBeneficiaires } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/implementation/prisma/rechercher-beneficiaires.query'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { z } from 'zod'

const RechercherBeneficiairesValidation = z.object({
  query: z.string(),
  excludeIds: z.array(BeneficiaireId.schema).default([]),
  mediateurId: MediateurId.schema,
})

export const rechercherBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withMediateur())
  .use(withInput(RechercherBeneficiairesValidation))
  .execute(async ({ input }) => rechercherBeneficiaires(input))
