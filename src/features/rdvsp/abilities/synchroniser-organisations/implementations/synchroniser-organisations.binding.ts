import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import {
  type SynchroniserOrganisations,
  synchroniserOrganisations,
} from '../domain/synchroniser-organisations'
import { appliquerPlanOrganisations } from './prisma/appliquer-plan-organisations.mutation'
import { etatOrganisations } from './prisma/etat-organisations.query'

export const synchroniserLesOrganisations: SynchroniserOrganisations =
  synchroniserOrganisations({
    listerOrganisations: rdvServicePublicApi({
      ...configurationRdvServicePublic(),
      onJetonsRenouveles: enregistrerLesJetons,
      jetonsCourants,
    }).listerOrganisations,
    etatOrganisations,
    appliquerPlan: appliquerPlanOrganisations,
  })
