import { describe, expect, it } from 'vitest'
import { messageDuWebhookUsager } from './message-du-webhook-usager'

describe('messageDuWebhookUsager', () => {
  it('dit ce qui est arrivé à l’usager traité', () => {
    expect(messageDuWebhookUsager({ _tag: 'traite', action: 'misAJour' })).toBe(
      'usager misAJour',
    )
  })

  it('dit pourquoi la notification est ignorée', () => {
    expect(
      messageDuWebhookUsager({ _tag: 'ignore', raison: 'creationDeferee' }),
    ).toBe('notification usager ignorée : creationDeferee')
  })
})
