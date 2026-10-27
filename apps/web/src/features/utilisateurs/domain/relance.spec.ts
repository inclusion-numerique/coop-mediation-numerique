import {
  actionDeRelance,
  type PhaseDeRelance,
  Relance,
  relanceApres,
} from './relance'

const MAINTENANT = new Date('2026-10-21T00:00:00.000Z')
const UN_JOUR = 24 * 60 * 60 * 1000

const ilYA = (jours: number): Date =>
  new Date(MAINTENANT.getTime() - jours * UN_JOUR)

const action = (
  phase: PhaseDeRelance,
  jours: number,
  relance: Parameters<typeof Relance>[0],
  {
    aProduit = false,
    suppressionAnnoncee = relance === 'AvertissementJ90' ? ilYA(1) : null,
  }: { aProduit?: boolean; suppressionAnnoncee?: Date | null } = {},
) =>
  actionDeRelance(
    {
      phase,
      depuis: ilYA(jours),
      relance: Relance(relance),
      suppressionAnnoncee,
      aProduit,
    },
    MAINTENANT,
  )

describe('relances d’une inscription inachevée', () => {
  it.each([
    [8, 'Aucune', { _tag: 'Relancer', palier: 7 }],
    [31, 'J7', { _tag: 'Relancer', palier: 30 }],
    [61, 'J30', { _tag: 'Relancer', palier: 60 }],
    [40, 'Aucune', { _tag: 'Relancer', palier: 7 }],
    [106, 'AvertissementJ90', { _tag: 'Effacer' }],
    [50, 'J30', { _tag: 'Rien' }],
    [3, 'J7', { _tag: 'Reinitialiser' }],
  ] as const)('%i jours, relance %s', (jours, relance, attendu) => {
    expect(action('Inscription', jours, relance)).toEqual(attendu)
  })

  it('avertit à J+90 en annonçant la suppression à J+105', () => {
    expect(action('Inscription', 91, 'J60')).toEqual({
      _tag: 'Avertir',
      suppressionLe: new Date(ilYA(91).getTime() + 105 * UN_JOUR),
      joursRestants: 14,
    })
  })

  it('laisse quatorze jours de préavis à un compte averti en retard', () => {
    expect(action('Inscription', 200, 'Aucune')).toEqual({
      _tag: 'Avertir',
      suppressionLe: new Date(MAINTENANT.getTime() + 14 * UN_JOUR),
      joursRestants: 14,
    })
  })

  it('n’efface pas avant la date annoncée', () => {
    expect(
      action('Inscription', 200, 'AvertissementJ90', {
        suppressionAnnoncee: new Date(MAINTENANT.getTime() + UN_JOUR),
      }),
    ).toEqual({ _tag: 'Rien' })
  })

  it('avertit de nouveau un compte averti sans date annoncée', () => {
    expect(
      action('Inscription', 200, 'AvertissementJ90', {
        suppressionAnnoncee: null,
      }),
    ).toEqual({
      _tag: 'Avertir',
      suppressionLe: new Date(MAINTENANT.getTime() + 14 * UN_JOUR),
      joursRestants: 14,
    })
  })
})

describe('relances d’un inscrit qui n’a rien produit', () => {
  it.each([
    [8, 'Aucune', { _tag: 'Relancer', palier: 7 }],
    [40, 'Aucune', { _tag: 'Relancer', palier: 30 }],
    [61, 'J30', { _tag: 'Relancer', palier: 60 }],
    [106, 'AvertissementJ90', { _tag: 'Effacer' }],
  ] as const)('%i jours, relance %s', (jours, relance, attendu) => {
    expect(action('Nouveau', jours, relance)).toEqual(attendu)
  })

  it('ne relance jamais un compte qui a produit', () => {
    expect(
      action('Nouveau', 106, 'AvertissementJ90', { aProduit: true }),
    ).toEqual({
      _tag: 'Rien',
    })
  })
})

describe('relance enregistrée après une action', () => {
  it.each([
    [{ _tag: 'Relancer', palier: 30 } as const, 'J30'],
    [
      {
        _tag: 'Avertir',
        suppressionLe: MAINTENANT,
        joursRestants: 1,
      } as const,
      'AvertissementJ90',
    ],
    [{ _tag: 'Reinitialiser' } as const, 'Aucune'],
    [{ _tag: 'Effacer' } as const, null],
  ])('%o → %s', (actionFaite, attendue) => {
    expect(relanceApres(actionFaite)).toBe(attendue)
  })
})
