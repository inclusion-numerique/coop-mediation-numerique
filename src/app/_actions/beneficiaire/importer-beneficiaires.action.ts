'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { ImporterBeneficiairesValidation } from '@/features/beneficiaire/abilities/importer-beneficiaires/action/importer-beneficiaires.validation'
import { importerBeneficiaires } from '@/features/beneficiaire/abilities/importer-beneficiaires/domain/importer-beneficiaires'
import { enregistrerLesBeneficiairesImportes } from '@/features/beneficiaire/abilities/importer-beneficiaires/implementations/prisma/importer-beneficiaires.mutation'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { withInput } from '@/libraries/nextjs'

export const importerBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(ImporterBeneficiairesValidation))
  .execute(async ({ input, mediateur }) => {
    const importation = await importerBeneficiaires({
      enregistrerLesBeneficiairesImportes,
    })({
      lignes: input.beneficiaires.map((beneficiaire) => ({
        id: BeneficiaireId(crypto.randomUUID()),
        beneficiaire,
      })),
      mediateurId: MediateurId(mediateur.id),
      maintenant: new Date(),
    })
    return { importes: importation.data.beneficiaires.length }
  })
