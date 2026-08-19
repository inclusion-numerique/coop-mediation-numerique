import type { Result } from '@app/web/libraries/result'
import type { CompteRdvUtilisable } from '../../../domain/compte-rdv'
import type { ErreurRdvApi } from '../../../domain/errors'
import type { Organisation } from '../../../domain/organisation'
import type { OrganisationId } from '../../../domain/organisation-id'
import type { PlanSynchronisation } from './plan-synchronisation'

/**
 * Bilan d'une synchronisation, dans la forme qu'attend le journal de synchro.
 * `deleted` compte des rattachements retirés, non des organisations supprimées :
 * une organisation quittée continue d'exister chez RDV Service Public comme dans
 * La Coop, seul le lien avec le compte disparaît.
 */
export type BilanSynchronisation = {
  readonly noop: number
  readonly created: number
  readonly updated: number
  readonly deleted: number
  readonly count: number
}

export type SynchroniserOrganisations = (
  compte: CompteRdvUtilisable,
) => Promise<Result<BilanSynchronisation, ErreurRdvApi>>

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
export const bilanDuPlan = (
  plan: PlanSynchronisation,
  recues: number,
): BilanSynchronisation => ({
  noop: plan.inchangees.length,
  created: plan.aCreer.length,
  updated: plan.aMettreAJour.length + plan.aRattacher.length,
  deleted: plan.aDetacher.length,
  count: recues,
})
