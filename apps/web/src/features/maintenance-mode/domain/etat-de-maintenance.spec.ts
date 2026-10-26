import {
  type EtatDeMaintenance,
  messageAffiche,
  peutModifierPendantLaMaintenance,
} from './etat-de-maintenance'
import {
  MESSAGE_DE_MAINTENANCE_PAR_DEFAUT,
  MessageDeMaintenance,
} from './message-de-maintenance'

const inactive: EtatDeMaintenance = { _tag: 'Inactive' }
const active: EtatDeMaintenance = { _tag: 'Active', message: null }

describe('maintenance', () => {
  it.each(['Admin', 'Support', 'User'] as const)(
    'laisse modifier le rôle %s hors maintenance',
    (role) => {
      expect(peutModifierPendantLaMaintenance({ role, etat: inactive })).toBe(
        true,
      )
    },
  )

  it('bloque les médiateurs et coordinateurs pendant la maintenance', () => {
    expect(
      peutModifierPendantLaMaintenance({ role: 'User', etat: active }),
    ).toBe(false)
  })

  it.each(['Admin', 'Support'] as const)(
    'laisse modifier le rôle %s pendant la maintenance',
    (role) => {
      expect(peutModifierPendantLaMaintenance({ role, etat: active })).toBe(
        true,
      )
    },
  )

  it('affiche le message de la maintenance en cours', () => {
    expect(
      messageAffiche({
        _tag: 'Active',
        message: MessageDeMaintenance('Bascule de la base'),
      }),
    ).toBe('Bascule de la base')
  })

  it('affiche le message par défaut d’une maintenance sans message', () => {
    expect(messageAffiche(active)).toBe(MESSAGE_DE_MAINTENANCE_PAR_DEFAUT)
  })
})
