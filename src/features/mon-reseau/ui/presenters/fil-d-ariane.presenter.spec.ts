import { describe, expect, it } from 'vitest'
import { filDArianeDesLieux } from './fil-d-ariane.presenter'

describe('fil d’Ariane du réseau', () => {
  it('passe par l’annuaire des lieux pour atteindre un lieu', () => {
    expect(filDArianeDesLieux('69')).toEqual([
      {
        label: 'Mon réseau (69)',
        linkProps: { href: '/coop/mon-reseau/69' },
      },
      {
        label: "Annuaire des lieux d'activités",
        linkProps: { href: '/coop/mon-reseau/69/lieux' },
      },
    ])
  })
})
