import type { CreerOuFusionnerDepuisUsagersExternes } from '@/features/rdvsp/domain/ports'
import { rdvServicePublicApiBinding } from '@/features/rdvsp/implementations/rdv-service-public.binding'
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
      listerRdvs: rdvServicePublicApiBinding.listerRdvs,
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
