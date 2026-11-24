import type { RdvConnu } from '@/features/rdvsp/abilities/recevoir-webhook-rdv/domain/decision-webhook'
import { decisionPourWebhookRdv } from '@/features/rdvsp/abilities/recevoir-webhook-rdv/domain/decision-webhook'
import type { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import type { RdvAgentId } from '@/features/rdvsp/domain/identifiants/rdv-agent-id'
import type { RdvId } from '@/features/rdvsp/domain/identifiants/rdv-id'
import type { Rdv } from '@/features/rdvsp/domain/rdv/rdv'
import type { EvenementWebhook } from '@/features/rdvsp/domain/webhook/evenement-webhook'
import type { Result } from '@/libraries/result'

type RaisonNonTraitee = 'payloadInexploitable' | 'aucunAgent' | 'compteInconnu'

/**
 * Issue d'une notification. Elle ne rend jamais d'erreur : une notification que
 * La Coop ne sait pas traiter n'est pas une défaillance du service émetteur, et
 * lui répondre en échec le ferait réessayer sans fin.
 */
type ResultatWebhookRdv =
  | { readonly _tag: 'traite'; readonly action: 'enregistre' | 'supprime' }
  | { readonly _tag: 'ignore'; readonly raison: string }

export type RecevoirWebhookRdv = (input: {
  readonly evenement: EvenementWebhook
  readonly payload: unknown
}) => Promise<ResultatWebhookRdv>

/**
 * Traduit la notification, ou renonce.
 *
 * L'agent en est extrait au passage : c'est lui qui désigne le compte concerné,
 * la notification n'en portant aucun autre indice.
 */
export type LireNotificationRdv = (
  payload: unknown,
) => Result<{ agentId: RdvAgentId; rdv: Rdv }, RaisonNonTraitee>

/**
 * L'organisation du rendez-vous est-elle déjà connue de La Coop ?
 *
 * Seule la synchronisation crée les organisations. Une notification peut la
 * précéder — un agent rejoint une organisation, RDV Service Public notifie avant
 * la passe suivante — et l'écriture butait alors sur la clé étrangère, rendant
 * un 500 là où la route promet de renoncer proprement.
 */
export type OrganisationConnue = (
  organisationId: OrganisationId,
) => Promise<boolean>

export type ComptePourWebhook = (agentId: RdvAgentId) => Promise<{
  readonly synchroniserDepuis: Date | null
  readonly mediateurId: string | null
} | null>

export type RdvConnuParId = (rdvId: RdvId) => Promise<RdvConnu | null>

export type EnregistrerRdvDeLaNotification = (input: {
  readonly rdv: Rdv
  readonly brut: unknown
}) => Promise<void>

export type SupprimerRdvDeLaNotification = (rdvId: RdvId) => Promise<void>

export type RapprocherBeneficiairesDuRdv = (input: {
  readonly rdv: Rdv
  readonly mediateurId: string
}) => Promise<void>

export type DependancesRecevoirWebhookRdv = {
  readonly lireNotification: LireNotificationRdv
  readonly comptePourWebhook: ComptePourWebhook
  readonly rdvConnuParId: RdvConnuParId
  readonly organisationConnue: OrganisationConnue
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
    organisationConnue,
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

    // L'organisation porte le rendez-vous : l'écrire sans elle violerait la clé
    // étrangère. On renonce, la synchronisation rattrapera.
    if (!(await organisationConnue(rdv.organisationId))) {
      return { _tag: 'ignore', raison: 'organisationInconnue' }
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
