import type { CreerOuFusionnerDepuisUsagersExternes } from '../../../domain/ports'
import type { EvenementWebhook } from '../../../domain/webhook/evenement-webhook'
import { journaliserWebhook } from '../../../implementations/webhook/journal-du-webhook.mutation'
import { recevoirWebhookRdv } from '../domain/recevoir-webhook-rdv'
import { lireNotificationRdv } from './api/notification-rdv.params'
import { rapprocherBeneficiairesDuRdv } from './prisma/rapprocher-beneficiaires-du-rdv.adapter'
import {
  comptePourWebhook,
  enregistrerRdvDeLaNotification,
  organisationConnue,
  rdvConnuParId,
  supprimerRdvDeLaNotification,
} from './prisma/webhook-rdv.mutation'

const recevoirAvec = (
  creerOuFusionner: CreerOuFusionnerDepuisUsagersExternes,
) =>
  recevoirWebhookRdv({
    lireNotification: lireNotificationRdv,
    comptePourWebhook,
    rdvConnuParId,
    organisationConnue,
    enregistrer: enregistrerRdvDeLaNotification,
    supprimer: supprimerRdvDeLaNotification,
    rapprocherBeneficiaires: rapprocherBeneficiairesDuRdv(
      creerOuFusionner,
      journaliserWebhook,
    ),
  })

/**
 * Composition de l'ability avec ses adaptateurs réels, appelée par la route de
 * notification. Elle ne fait rien de plus que journaliser ce que l'ability a
 * décidé : la lecture, la décision et l'écriture vivent dans la feature.
 */
export const traiterNotificationRdvAvec =
  (creerOuFusionner: CreerOuFusionnerDepuisUsagersExternes) =>
  async ({
    evenement,
    donnees,
  }: {
    evenement: EvenementWebhook
    donnees: unknown
  }) => {
    const resultat = await recevoirAvec(creerOuFusionner)({
      evenement,
      payload: donnees,
    })

    journaliserWebhook(
      resultat._tag === 'traite'
        ? `rendez-vous ${resultat.action}`
        : `notification ignorée : ${resultat.raison}`,
    )
  }
