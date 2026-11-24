import { rdvServicePublicApiBinding } from '@/features/rdvsp/implementations/rdv-service-public.binding'
import {
  type SynchroniserOrganisations,
  synchroniserOrganisations,
} from '../domain/synchroniser-organisations'
import { appliquerPlanOrganisations } from './prisma/appliquer-plan-organisations.mutation'
import { etatOrganisations } from './prisma/etat-organisations.query'

export const synchroniserLesOrganisations: SynchroniserOrganisations =
  synchroniserOrganisations({
    listerOrganisations: rdvServicePublicApiBinding.listerOrganisations,
    etatOrganisations,
    appliquerPlan: appliquerPlanOrganisations,
  })
