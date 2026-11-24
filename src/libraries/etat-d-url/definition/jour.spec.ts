import { describe, expect, it } from 'vitest'
import { jourLocal, jourUtc } from './jour'

describe('jour', () => {
  it('garde le jour choisi dans le calendrier en l’écrivant en UTC', () => {
    expect(jourUtc(new Date(2026, 0, 15)).toISOString()).toBe(
      '2026-01-15T00:00:00.000Z',
    )
  })

  it('affiche dans le calendrier le jour lu dans l’URL', () => {
    expect(jourLocal(new Date('2026-01-15')).getDate()).toBe(15)
  })
})
