import type { BeneficiaireLie } from '@/features/rdvsp/abilities/recevoir-webhook-usager/domain/decision-webhook-usager'
import { decisionPourWebhookUsager } from '@/features/rdvsp/abilities/recevoir-webhook-usager/domain/decision-webhook-usager'
import type { UsagerId } from '@/features/rdvsp/domain/identifiants/usager-id'
import type { Usager } from '@/features/rdvsp/domain/usager'
import type { EvenementWebhook } from '@/features/rdvsp/domain/webhook/evenement-webhook'
import type { Result } from '@/libraries/result'

export type ResultatWebhookUsager =
  | {
      readonly _tag: 'traite'
      readonly action: 'misAJour' | 'anonymiseEtSupprime'
    }
  | { readonly _tag: 'ignore'; readonly raison: string }

export type RecevoirWebhookUsager = (input: {
  readonly evenement: EvenementWebhook
  readonly payload: unknown
}) => Promise<ResultatWebhookUsager>

export type LireNotificationUsager = (
  payload: unknown,
) => Result<Usager, 'payloadInexploitable'>

export type BeneficiairesLiesAUsager = (
  usagerId: UsagerId,
) => Promise<readonly BeneficiaireLie[]>

export type MettreAJourUsager = (usager: Usager) => Promise<void>

/**
 * Anonymise les bénéficiaires descendant de l'usager, délie ce qui reste et
 * supprime l'usager — d'un seul tenant : un effacement à moitié appliqué laisserait des fiches nominatives
 * derrière un usager disparu.
 */
export type AnonymiserEtSupprimerUsager = (input: {
  readonly usagerId: UsagerId
  readonly beneficiaires: readonly BeneficiaireLie[]
}) => Promise<void>

export type DependancesRecevoirWebhookUsager = {
  readonly lireNotification: LireNotificationUsager
  readonly beneficiairesLies: BeneficiairesLiesAUsager
  readonly mettreAJour: MettreAJourUsager
  readonly anonymiserEtSupprimer: AnonymiserEtSupprimerUsager
}

export const recevoirWebhookUsager =
  ({
    lireNotification,
    beneficiairesLies,
    mettreAJour,
    anonymiserEtSupprimer,
  }: DependancesRecevoirWebhookUsager): RecevoirWebhookUsager =>
  async ({ evenement, payload }) => {
    const notification = lireNotification(payload)

    if (!notification.success) {
      return { _tag: 'ignore', raison: notification.error }
    }

    const usager = notification.data
    const beneficiaires = await beneficiairesLies(usager.id)

    const decision = decisionPourWebhookUsager({
      evenement,
      beneficiairesLies: beneficiaires,
    })

    if (decision._tag === 'ignorer') {
      return { _tag: 'ignore', raison: decision.raison }
    }

    if (decision._tag === 'mettreAJour') {
      await mettreAJour(usager)
      return { _tag: 'traite', action: 'misAJour' }
    }

    await anonymiserEtSupprimer({
      usagerId: usager.id,
      beneficiaires,
    })

    return { _tag: 'traite', action: 'anonymiseEtSupprime' }
  }
