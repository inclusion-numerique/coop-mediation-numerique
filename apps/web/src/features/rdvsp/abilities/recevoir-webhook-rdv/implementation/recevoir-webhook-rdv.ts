import { decisionPourWebhookRdv } from '../domain/decision-webhook'
import type {
  ComptePourWebhook,
  EnregistrerRdvDeLaNotification,
  LireNotificationRdv,
  RapprocherBeneficiairesDuRdv,
  RdvConnuParId,
  RecevoirWebhookRdv,
  SupprimerRdvDeLaNotification,
} from '../domain/recevoir-webhook-rdv'

export type DependancesRecevoirWebhookRdv = {
  readonly lireNotification: LireNotificationRdv
  readonly comptePourWebhook: ComptePourWebhook
  readonly rdvConnuParId: RdvConnuParId
  readonly enregistrer: EnregistrerRdvDeLaNotification
  readonly supprimer: SupprimerRdvDeLaNotification
  readonly rapprocherBeneficiaires: RapprocherBeneficiairesDuRdv
}

/**
 * Traite une notification de rendez-vous.
 *
 * Tout ce qui n'est pas traitable est ignoré et nommé : une notification pour un
 * compte que La Coop ne suit pas, ou dont le payload a changé de forme, n'est pas
 * une erreur à renvoyer au service — ce serait l'inviter à réessayer sans fin.
 */
export const recevoirWebhookRdv =
  ({
    lireNotification,
    comptePourWebhook,
    rdvConnuParId,
    enregistrer,
    supprimer,
    rapprocherBeneficiaires,
  }: DependancesRecevoirWebhookRdv): RecevoirWebhookRdv =>
  async ({ evenement, payload }) => {
    const notification = lireNotification(payload)

    if (!notification.success) {
      return { _tag: 'ignore', raison: notification.error }
    }

    const { agentId, rdv } = notification.data
    const compte = await comptePourWebhook(agentId)

    if (compte === null) {
      return { _tag: 'ignore', raison: 'compteInconnu' }
    }

    const decision = decisionPourWebhookRdv({
      evenement,
      recu: rdv,
      connu: await rdvConnuParId(rdv.id),
      synchroniserDepuis: compte.synchroniserDepuis,
    })

    if (decision._tag === 'ignorer') {
      return { _tag: 'ignore', raison: decision.raison }
    }

    if (decision._tag === 'supprimer') {
      await supprimer(rdv.id)
      return { _tag: 'traite', action: 'supprime' }
    }

    await enregistrer({ rdv, brut: payload })

    // Après l'enregistrement, et découplé de lui : un rapprochement en échec ne
    // doit pas laisser le rendez-vous non réconcilié, symptôme déjà observé en
    // production.
    if (compte.mediateurId !== null) {
      await rapprocherBeneficiaires({ rdv, mediateurId: compte.mediateurId })
    }

    return { _tag: 'traite', action: 'enregistre' }
  }
