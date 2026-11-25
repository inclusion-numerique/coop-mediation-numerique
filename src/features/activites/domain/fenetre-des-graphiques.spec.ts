import { describe, expect, it } from 'vitest'
import {
  fenetreDe,
  fenetresDuPerimetre,
  fenetresNationales,
  joursDeLaFenetre,
  moisDeLaFenetre,
} from './fenetre-des-graphiques'
import { Jour } from './jour'

describe('fenêtre des graphiques', () => {
  it('sans début, couvre les 30 derniers jours jusqu’à la fin', () => {
    expect(
      joursDeLaFenetre(fenetreDe({ debut: null, fin: Jour('2026-03-31') })),
    ).toEqual({ du: '2026-03-02', au: '2026-03-31' })
  })

  it('sans début, couvre les 12 derniers mois entiers jusqu’à la fin', () => {
    expect(
      moisDeLaFenetre(fenetreDe({ debut: null, fin: Jour('2026-03-10') })),
    ).toEqual({ du: '2025-04-01', au: '2026-03-10' })
  })

  it('bornée, part du début pour les jours', () => {
    expect(
      joursDeLaFenetre(
        fenetreDe({ debut: Jour('2026-01-15'), fin: Jour('2026-03-10') }),
      ),
    ).toEqual({ du: '2026-01-15', au: '2026-03-10' })
  })

  it('bornée, part du premier jour du mois du début pour les mois', () => {
    expect(
      moisDeLaFenetre(
        fenetreDe({ debut: Jour('2026-01-15'), fin: Jour('2026-03-10') }),
      ),
    ).toEqual({ du: '2026-01-01', au: '2026-03-10' })
  })
})

describe('fenêtres des statistiques', () => {
  it('d’un périmètre, partagent la même fenêtre pour les jours et les mois', () => {
    expect(
      fenetresDuPerimetre({ du: Jour('2026-01-15'), fin: Jour('2026-03-01') }),
    ).toStrictEqual({
      parJour: {
        type: 'Bornee',
        debut: Jour('2026-01-15'),
        fin: Jour('2026-03-01'),
      },
      parMois: {
        type: 'Bornee',
        debut: Jour('2026-01-15'),
        fin: Jour('2026-03-01'),
      },
    })
  })

  it('nationales, glissent sur les mois jusqu’à aujourd’hui', () => {
    expect(
      fenetresNationales({
        du: Jour('2026-01-15'),
        au: null,
        aujourdhui: Jour('2026-03-01'),
      }),
    ).toStrictEqual({
      parJour: {
        type: 'Bornee',
        debut: Jour('2026-01-15'),
        fin: Jour('2026-03-01'),
      },
      parMois: { type: 'Glissante', fin: Jour('2026-03-01') },
    })
  })
})
