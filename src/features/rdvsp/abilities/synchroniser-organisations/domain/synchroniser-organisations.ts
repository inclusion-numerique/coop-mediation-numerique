import type { PlanSynchronisation } from '@/features/rdvsp/abilities/synchroniser-organisations/domain/plan-synchronisation'
import { planifierSynchronisation } from '@/features/rdvsp/abilities/synchroniser-organisations/domain/plan-synchronisation'
import type { CompteRdvUtilisable } from '@/features/rdvsp/domain/compte/compte-rdv'
import type { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import type { Result } from '@/libraries/result'
import { success } from '@/libraries/result'
import type { EchecDeSynchroniserOrganisations } from './errors'
import type { SynchroniserOrganisationsPorts } from './ports'

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
  readonly plan: PlanSynchronisation
  readonly bilan: BilanSynchronisation
  readonly organisationIdsRecues: readonly OrganisationId[]
}

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
