import { MessageDeMaintenance } from '@app/web/features/maintenance-mode/domain'
import { reglageDeLaMaintenance } from './reglage'

const message = MessageDeMaintenance('Bascule de la base')
const periodeEnCours = { id: 'periode-en-cours' }

describe('réglage de la maintenance', () => {
  it('ouvre une période quand aucune n’est en cours', () => {
    expect(
      reglageDeLaMaintenance({
        periodeEnCours: null,
        demande: { _tag: 'Activer', message },
      }),
    ).toEqual({ _tag: 'Ouvrir', message })
  })

  it('change le message de la période en cours', () => {
    expect(
      reglageDeLaMaintenance({
        periodeEnCours,
        demande: { _tag: 'Activer', message: null },
      }),
    ).toEqual({
      _tag: 'ChangerLeMessage',
      periodeId: 'periode-en-cours',
      message: null,
    })
  })

  it('clôt la période en cours', () => {
    expect(
      reglageDeLaMaintenance({
        periodeEnCours,
        demande: { _tag: 'Desactiver' },
      }),
    ).toEqual({ _tag: 'Clore', periodeId: 'periode-en-cours' })
  })

  it('ne fait rien quand on désactive sans période en cours', () => {
    expect(
      reglageDeLaMaintenance({
        periodeEnCours: null,
        demande: { _tag: 'Desactiver' },
      }),
    ).toEqual({ _tag: 'RienAFaire' })
  })
})
