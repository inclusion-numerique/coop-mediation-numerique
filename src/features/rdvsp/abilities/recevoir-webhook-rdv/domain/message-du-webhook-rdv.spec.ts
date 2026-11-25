import { describe, expect, it } from 'vitest'
import { messageDuWebhookRdv } from './message-du-webhook-rdv'

describe('messageDuWebhookRdv', () => {
  it('dit ce qui est arrivé au rendez-vous traité', () => {
    expect(messageDuWebhookRdv({ _tag: 'traite', action: 'supprime' })).toBe(
      'rendez-vous supprime',
    )
  })

  it('dit pourquoi la notification est ignorée', () => {
    expect(
      messageDuWebhookRdv({ _tag: 'ignore', raison: 'compteInconnu' }),
    ).toBe('notification ignorée : compteInconnu')
  })
})
