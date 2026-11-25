import type { PlanSynchronisation } from '@/features/rdvsp/abilities/synchroniser-organisations/domain/plan-synchronisation'
import { planifierSynchronisation } from '@/features/rdvsp/abilities/synchroniser-organisations/domain/plan-synchronisation'
import type { CompteRdvUtilisable } from '@/features/rdvsp/domain/compte/compte-rdv'
import type { ErreurRdvApi } from '@/features/rdvsp/domain/errors'
import type { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import type { Organisation } from '@/features/rdvsp/domain/organisation'
import type { RdvServicePublicApi } from '@/features/rdvsp/domain/ports'
import type { Result } from '@/libraries/result'
import { success } from '@/libraries/result'

/**
 * Bilan d'une synchronisation, dans la forme qu'attend le journal de synchro.
 * `deleted` compte des rattachements retirés, non des organisations supprimées :
 * une organisation quittée continue d'exister chez RDV Service Public comme dans
 * La Coop, seul le lien avec le compte disparaît.
 */
type BilanSynchronisation = {
  readonly noop: number
  readonly created: number
  readonly updated: number
  readonly deleted: number
  readonly count: number
}

type OrganisationsSynchronisees = {
  readonly bilan: BilanSynchronisation
  readonly organisationIdsRecues: readonly OrganisationId[]
}

export type SynchroniserOrganisations = (
  compte: CompteRdvUtilisable,
) => Promise<Result<OrganisationsSynchronisees, ErreurRdvApi>>

/** Organisations déjà connues de La Coop, et rattachements actuels du compte. */
export type EtatOrganisations = (input: {
  readonly compte: CompteRdvUtilisable
  readonly idsRecus: readonly OrganisationId[]
}) => Promise<{
  readonly connues: readonly Organisation[]
  readonly rattachements: readonly OrganisationId[]
}>

export type AppliquerPlanOrganisations = (input: {
  readonly compte: CompteRdvUtilisable
  readonly plan: PlanSynchronisation
}) => Promise<void>

/**
 * Les rattachements créés ou retirés comptent comme des mises à jour du compte,
 * pas comme des créations d'organisations. L'ancien code additionnait les
 * détachements à la fois dans `updated` et dans `deleted` ; ils ne sont plus
 * comptés qu'une fois.
 */
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

    return success({
      bilan: bilanDuPlan(plan, recues.data.length),
      organisationIdsRecues: recues.data.map((organisation) => organisation.id),
    })
  }
