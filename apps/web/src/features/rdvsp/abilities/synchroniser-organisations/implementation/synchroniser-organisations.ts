import { success } from '@app/web/libraries/result'
import type { RdvServicePublicApi } from '../../../domain/rdv-service-public.port'
import { planifierSynchronisation } from '../domain/plan-synchronisation'
import {
  type AppliquerPlanOrganisations,
  bilanDuPlan,
  type EtatOrganisations,
  type SynchroniserOrganisations,
} from '../domain/synchroniser-organisations'

export type DependancesSynchroniserOrganisations = {
  readonly listerOrganisations: RdvServicePublicApi['listerOrganisations']
  readonly etatOrganisations: EtatOrganisations
  readonly appliquerPlan: AppliquerPlanOrganisations
}

/**
 * Lire, décider, appliquer. Un échec de l'API laisse la base intacte : rien
 * n'est écrit avant que la réponse soit complète, la liste des organisations
 * étant paginée et n'ayant de sens qu'entière.
 */
export const synchroniserOrganisations =
  ({
    listerOrganisations,
    etatOrganisations,
    appliquerPlan,
  }: DependancesSynchroniserOrganisations): SynchroniserOrganisations =>
  async (compte) => {
    const recues = await listerOrganisations(compte)

    if (!recues.success) {
      return recues
    }

    const { connues, rattachements } = await etatOrganisations({
      compte,
      idsRecus: recues.data.map((organisation) => organisation.id),
    })

    const plan = planifierSynchronisation({
      recues: recues.data,
      connues,
      rattachements,
    })

    await appliquerPlan({ compte, plan })

    return success(bilanDuPlan(plan, recues.data.length))
  }
