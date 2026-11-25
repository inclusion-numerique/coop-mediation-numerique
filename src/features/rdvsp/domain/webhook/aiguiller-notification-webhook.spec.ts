import { describe, expect, it } from 'vitest'
import { aiguillerNotificationWebhook } from './aiguiller-notification-webhook'
import { EvenementWebhook } from './evenement-webhook'

const aiguiller = aiguillerNotificationWebhook({
  traiterRdv: async () => 'rdv',
  traiterUsager: async () => 'usager',
  journaliser: () => undefined,
})

describe('aiguillerNotificationWebhook', () => {
  it('confie une notification de rendez-vous au traitement des rendez-vous', async () => {
    expect(
      await aiguiller({
        _tag: 'rdv',
        evenement: EvenementWebhook('created'),
        donnees: {},
      }),
    ).toBe('rdv')
  })

  it('confie une notification d’usager au traitement des usagers', async () => {
    expect(
      await aiguiller({
        _tag: 'usager',
        evenement: EvenementWebhook('updated'),
        donnees: {},
      }),
    ).toBe('usager')
  })

  it('ne confie une notification ignorée à aucun traitement', async () => {
    expect(await aiguiller({ _tag: 'ignoree', modele: 'agent' })).toBeNull()
  })
})
