import { describe, expect, it } from 'vitest'
import { MessageDeMaintenance } from '@/features/maintenance-mode/domain'
import { periodeDeMaintenance } from './periode-de-maintenance.transfer'

const debut = new Date('2026-11-20T08:00:00.000Z')
const fin = new Date('2026-11-20T09:00:00.000Z')

describe('période de maintenance lue en base', () => {
  it('lit une période terminée avec son message', () => {
    expect(
      periodeDeMaintenance({
        id: 'periode-1',
        startedAt: debut,
        endedAt: fin,
        message: 'Bascule de la base',
      }),
    ).toEqual({
      id: 'periode-1',
      debut,
      fin,
      message: MessageDeMaintenance('Bascule de la base'),
    })
  })

  it.each<{ cas: string; message: string | null }>([
    { cas: 'sans message', message: null },
    { cas: 'dont le message enregistré est invalide', message: '   ' },
  ])('lit une période en cours $cas comme sans message', ({ message }) => {
    expect(
      periodeDeMaintenance({
        id: 'periode-1',
        startedAt: debut,
        endedAt: null,
        message,
      }),
    ).toEqual({ id: 'periode-1', debut, fin: null, message: null })
  })
})
