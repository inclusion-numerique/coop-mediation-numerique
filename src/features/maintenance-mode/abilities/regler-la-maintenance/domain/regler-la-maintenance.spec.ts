import { describe, expect, it } from 'vitest'
import {
  AuteurId,
  MessageDeMaintenance,
} from '@/features/maintenance-mode/domain'
import { reglerLaMaintenance } from './regler-la-maintenance'

const message = MessageDeMaintenance('Bascule de la base')

const maintenant = new Date('2026-11-26T08:00:00.000Z')

const auteurId = AuteurId('a1b2c3d4-0000-4000-8000-000000000001')

const ecritures = {
  ouvrirUnePeriode: async () => undefined,
  changerLeMessage: async () => undefined,
  cloreLaPeriode: async () => undefined,
}

const sansPeriodeEnCours = reglerLaMaintenance({
  lireLaPeriodeEnCours: async () => null,
  ...ecritures,
})

const avecPeriodeEnCours = reglerLaMaintenance({
  lireLaPeriodeEnCours: async () => ({ id: 'periode-en-cours' }),
  ...ecritures,
})

describe('régler la maintenance', () => {
  it('ouvre une période quand aucune n’est en cours', async () => {
    expect(
      await sansPeriodeEnCours({
        demande: { _tag: 'Activer', message },
        auteurId,
        maintenant,
      }),
    ).toEqual({
      success: true,
      data: { _tag: 'Ouvrir', message, auteurId, debut: maintenant },
    })
  })

  it('change le message de la période en cours', async () => {
    expect(
      await avecPeriodeEnCours({
        demande: { _tag: 'Activer', message: null },
        auteurId,
        maintenant,
      }),
    ).toEqual({
      success: true,
      data: {
        _tag: 'ChangerLeMessage',
        periodeId: 'periode-en-cours',
        message: null,
      },
    })
  })

  it('clôt la période en cours', async () => {
    expect(
      await avecPeriodeEnCours({
        demande: { _tag: 'Desactiver' },
        auteurId,
        maintenant,
      }),
    ).toEqual({
      success: true,
      data: { _tag: 'Clore', periodeId: 'periode-en-cours', fin: maintenant },
    })
  })

  it('ne fait rien quand on désactive sans période en cours', async () => {
    expect(
      await sansPeriodeEnCours({
        demande: { _tag: 'Desactiver' },
        auteurId,
        maintenant,
      }),
    ).toEqual({ success: true, data: { _tag: 'RienAFaire' } })
  })
})
