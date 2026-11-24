import { describe, expect, it } from 'vitest'
import { etatDeLaTable } from './etat-de-la-table.search-params'

describe('état de la table des activités', () => {
  it('garde les paramètres de la liste dans l’état', () => {
    expect(
      etatDeLaTable({ du: '2026-01-01', types: 'Individuel', page: '2' }),
    ).toEqual({ du: '2026-01-01', types: 'Individuel', page: '2' })
  })

  it('garde un ordre reconnu', () => {
    expect(etatDeLaTable({ tri: 'date', ordre: 'asc' }).ordre).toBe('asc')
  })

  it('écarte un ordre inconnu', () => {
    expect(etatDeLaTable({ ordre: 'n-importe' }).ordre).toBeUndefined()
  })
})
