import {
  decisionPourWebhookUsager,
  perteParMediateur,
} from '../domain/decision-webhook-usager'
import type {
  AnonymiserEtSupprimerUsager,
  BeneficiairesLiesAUsager,
  LireNotificationUsager,
  MettreAJourUsager,
  RecevoirWebhookUsager,
} from '../domain/recevoir-webhook-usager'

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
      perteParMediateur: perteParMediateur(beneficiaires),
    })

    return { _tag: 'traite', action: 'anonymiseEtSupprime' }
  }
