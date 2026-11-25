import type { CreerOuFusionnerDepuisUsagersExternes } from '@/features/rdvsp/domain/ports'
import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import {
  type SynchroniserRdvs,
  synchroniserRdvs,
} from '../domain/synchroniser-rdvs'
import {
  appliquerPlanLot,
  supprimerMotifsOrphelins,
  supprimerRdvs,
} from './prisma/appliquer-plan-lot.mutation'
import { etatConnuDuLot, rdvsDejaImportes } from './prisma/etat-connu.query'
import { rapprocherBeneficiaires } from './prisma/rapprocher-beneficiaires.adapter'

export const synchroniserLesRdvsAvec =
  (creerOuFusionner: CreerOuFusionnerDepuisUsagersExternes) =>
  ({
    mediateurId,
    journaliser,
  }: {
    mediateurId: string
    journaliser: (message: string) => void
  }): SynchroniserRdvs =>
    synchroniserRdvs({
      listerRdvs: rdvServicePublicApi({
        ...configurationRdvServicePublic(),
        onJetonsRenouveles: enregistrerLesJetons,
        jetonsCourants,
      }).listerRdvs,
      rdvsDejaImportes,
      etatConnuDuLot,
      appliquerPlan: appliquerPlanLot,
      supprimerRdvs,
      supprimerMotifsOrphelins,
      rapprocherBeneficiaires: rapprocherBeneficiaires({
        mediateurId,
        creerOuFusionner,
        journaliser,
      }),
    })
