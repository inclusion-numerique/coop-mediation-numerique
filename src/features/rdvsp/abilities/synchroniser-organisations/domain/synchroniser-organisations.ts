import type { PlanSynchronisation } from '@/features/rdvsp/abilities/synchroniser-organisations/domain/plan-synchronisation'
import { planifierSynchronisation } from '@/features/rdvsp/abilities/synchroniser-organisations/domain/plan-synchronisation'
import type { CompteRdvUtilisable } from '@/features/rdvsp/domain/compte/compte-rdv'
import type { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import type { Result } from '@/libraries/result'
import { success } from '@/libraries/result'
import type { EchecDeSynchroniserOrganisations } from './errors'
import type { SynchroniserOrganisationsPorts } from './ports'

type BilanSynchronisation = {
  readonly noop: number
  readonly created: number
  readonly updated: number
  readonly deleted: number
  readonly count: number
}

type OrganisationsSynchronisees = {
  readonly plan: PlanSynchronisation
  readonly bilan: BilanSynchronisation
  readonly organisationIdsRecues: readonly OrganisationId[]
}

const bilanDuPlan = (
  plan: PlanSynchronisation,
  recues: number,
): BilanSynchronisation => ({
  noop: plan.inchangees.length,
  created: plan.aCreer.length,
  updated: plan.aMettreAJour.length + plan.aRattacher.length,
  deleted: plan.aDetacher.length,
  count: recues,
})

export const synchroniserOrganisations =
  ({
    listerOrganisations,
    etatOrganisations,
    appliquerPlan,
  }: SynchroniserOrganisationsPorts) =>
  async ({
    compte,
  }: {
    readonly compte: CompteRdvUtilisable
  }): Promise<
    Result<OrganisationsSynchronisees, EchecDeSynchroniserOrganisations>
  > => {
    const recues = await listerOrganisations(compte)

    if (!recues.success) {
      return recues
    }

    const organisationIdsRecues = recues.data.map(
      (organisation) => organisation.id,
    )

    const etat = await etatOrganisations({
      compte,
      idsRecus: organisationIdsRecues,
    })

    if (!etat.success) {
      return etat
    }

    const plan = planifierSynchronisation({
      recues: recues.data,
      connues: etat.data.connues,
      rattachements: etat.data.rattachements,
    })

    const application = await appliquerPlan({ compte, plan })

    if (!application.success) {
      return application
    }

    return success({
      plan,
      bilan: bilanDuPlan(plan, recues.data.length),
      organisationIdsRecues,
    })
  }
