import type { RdvId } from '@/features/rdvsp/domain/identifiants/rdv-id'
import {
  type Rapprochement,
  rapprocherLesUsagers,
} from '@/features/rdvsp/domain/rapprochement'
import type { Rdv } from '@/features/rdvsp/domain/rdv/rdv'
import type { EvenementWebhook } from '@/features/rdvsp/domain/webhook/evenement-webhook'
import { type Result, success } from '@/libraries/result'
import { decisionPourWebhookRdv, type RaisonIgnore } from './decision-webhook'
import type { EchecDeRecevoirWebhookRdv } from './errors'
import type { RecevoirWebhookRdvPorts } from './ports'

export type WebhookRdvTraite =
  | {
      readonly _tag: 'ignore'
      readonly raison: RaisonIgnore | 'compteInconnu' | 'organisationInconnue'
    }
  | { readonly _tag: 'supprime'; readonly rdvId: RdvId }
  | {
      readonly _tag: 'enregistre'
      readonly rdv: Rdv
      readonly rapprochement: Rapprochement
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
    lireLesUsagersARapprocher,
    rapprocherLesBeneficiaires,
  }: RecevoirWebhookRdvPorts) =>
  async ({
    evenement,
    payload,
  }: {
    readonly evenement: EvenementWebhook
    readonly payload: unknown
  }): Promise<Result<WebhookRdvTraite, EchecDeRecevoirWebhookRdv>> => {
    const notification = lireNotification(payload)

    if (!notification.success) {
      return notification
    }

    const { agentId, rdv } = notification.data
    const compte = await comptePourWebhook(agentId)

    if (compte === null) {
      return success({ _tag: 'ignore', raison: 'compteInconnu' })
    }

    const decision = decisionPourWebhookRdv({
      evenement,
      recu: rdv,
      connu: await rdvConnuParId(rdv.id),
      synchroniserDepuis: compte.synchroniserDepuis,
    })

    if (decision._tag === 'ignorer') {
      return success({ _tag: 'ignore', raison: decision.raison })
    }

    if (decision._tag === 'supprimer') {
      await supprimer(rdv.id)
      return success({ _tag: 'supprime', rdvId: rdv.id })
    }

    if (!(await organisationConnue(rdv.organisationId))) {
      return success({ _tag: 'ignore', raison: 'organisationInconnue' })
    }

    await enregistrer({ rdv, brut: payload })

    return success({
      _tag: 'enregistre',
      rdv,
      rapprochement: await rapprocherLesUsagers(
        { lireLesUsagersARapprocher, rapprocherLesBeneficiaires },
        {
          usagerIds: rdv.participations.map(
            (participation) => participation.usagerId,
          ),
          mediateurId: compte.mediateurId,
        },
      ),
    })
  }
