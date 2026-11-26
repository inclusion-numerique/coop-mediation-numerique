import { describe, expect, it } from 'vitest'
import { OrganisationId } from '../identifiants/organisation-id'
import {
  AbonnementWebhook,
  estAJour,
  WebhookId,
  type WebhookInstalle,
} from './webhook'

const webhook = (
  abonnements: readonly AbonnementWebhook[],
): WebhookInstalle => ({
  id: WebhookId(1),
  organisationId: OrganisationId(10),
  abonnements,
})

describe('estAJour', () => {
  it.each<[string, readonly AbonnementWebhook[], boolean]>([
    [
      'les abonnements de La Coop, dans n’importe quel ordre',
      [AbonnementWebhook('user'), AbonnementWebhook('rdv')],
      true,
    ],
    ['un abonnement manquant, à pousser', [AbonnementWebhook('rdv')], false],
    [
      'un abonnement en trop, à retirer',
      [
        AbonnementWebhook('rdv'),
        AbonnementWebhook('user'),
        AbonnementWebhook('motif'),
      ],
      false,
    ],
    [
      'un abonnement remplacé par un autre',
      [AbonnementWebhook('rdv'), AbonnementWebhook('lieu')],
      false,
    ],
  ])('juge à jour un webhook portant %s : %s', (_, abonnements, attendu) => {
    expect(estAJour(webhook(abonnements))).toBe(attendu)
  })

  it('compare aux abonnements attendus quand ils sont précisés', () => {
    expect(
      estAJour(webhook([AbonnementWebhook('rdv')]), [AbonnementWebhook('rdv')]),
    ).toBe(true)
  })
})
