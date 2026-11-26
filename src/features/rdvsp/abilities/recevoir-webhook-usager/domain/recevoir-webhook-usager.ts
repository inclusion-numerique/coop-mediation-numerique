import { type Result, success } from '@/libraries/result'
import type { EvenementWebhook } from '../../../domain/webhook/evenement-webhook'
import { decisionPourWebhookUsager } from './decision-webhook-usager'
import type { EchecDeRecevoirWebhookUsager } from './errors'
import type { RecevoirWebhookUsagerPorts } from './ports'
import type {
  AnonymisationDeLUsager,
  WebhookUsagerTraite,
} from './webhook-usager-traite'

export const recevoirWebhookUsager =
  ({
    lireNotification,
    beneficiairesLies,
    mettreAJour,
    anonymiserEtSupprimer,
  }: RecevoirWebhookUsagerPorts) =>
  async ({
    evenement,
    payload,
  }: {
    readonly evenement: EvenementWebhook
    readonly payload: unknown
  }): Promise<Result<WebhookUsagerTraite, EchecDeRecevoirWebhookUsager>> => {
    const notification = lireNotification(payload)

    if (!notification.success) {
      return notification
    }

    const usager = notification.data
    const beneficiaires = await beneficiairesLies(usager.id)

    const decision = decisionPourWebhookUsager({
      evenement,
      beneficiairesLies: beneficiaires,
    })

    if (decision._tag === 'ignorer') {
      return success({ _tag: 'ignore', raison: decision.raison })
    }

    if (decision._tag === 'mettreAJour') {
      await mettreAJour(usager)
      return success({ _tag: 'misAJour', usager })
    }

    const anonymisation: AnonymisationDeLUsager = {
      usagerId: usager.id,
      beneficiaires,
    }

    await anonymiserEtSupprimer(anonymisation)

    return success({ _tag: 'anonymiseEtSupprime', ...anonymisation })
  }
