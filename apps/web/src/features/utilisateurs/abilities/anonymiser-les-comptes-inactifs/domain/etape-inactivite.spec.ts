import { JAMAIS, jalon } from '@app/web/features/utilisateurs/domain'
import { etapeInactivite } from './etape-inactivite'

const maintenant = new Date('2026-10-20T01:00:00.000Z')

describe('étape d’inactivité', () => {
  it('laisse tranquille un compte actif depuis moins de 23 mois', () => {
    expect(
      etapeInactivite({
        derniereActivite: new Date('2025-01-01T00:00:00.000Z'),
        avertiLe: JAMAIS,
        maintenant,
      }),
    ).toEqual({ _tag: 'actif' })
  })

  it('avertit 30 jours avant les 2 ans d’inactivité', () => {
    expect(
      etapeInactivite({
        derniereActivite: new Date('2024-11-19T01:00:00.000Z'),
        avertiLe: JAMAIS,
        maintenant,
      }),
    ).toEqual({
      _tag: 'aAvertir',
      dateDeSuppression: new Date('2026-11-19T01:00:00.000Z'),
    })
  })

  it('n’avertit pas la veille du préavis', () => {
    expect(
      etapeInactivite({
        derniereActivite: new Date('2024-11-20T01:00:00.000Z'),
        avertiLe: JAMAIS,
        maintenant,
      }),
    ).toEqual({ _tag: 'actif' })
  })

  it('laisse toujours 30 jours de préavis à un compte déjà inactif depuis plus de 2 ans', () => {
    expect(
      etapeInactivite({
        derniereActivite: new Date('2023-06-01T00:00:00.000Z'),
        avertiLe: JAMAIS,
        maintenant,
      }),
    ).toEqual({
      _tag: 'aAvertir',
      dateDeSuppression: new Date('2026-11-19T01:00:00.000Z'),
    })
  })

  it('n’avertit pas deux fois', () => {
    expect(
      etapeInactivite({
        derniereActivite: new Date('2024-11-10T00:00:00.000Z'),
        avertiLe: jalon(new Date('2026-10-15T01:00:00.000Z')),
        maintenant,
      }),
    ).toEqual({
      _tag: 'enAttente',
      dateDeSuppression: new Date('2026-11-14T01:00:00.000Z'),
    })
  })

  it('supprime à l’échéance un compte averti au moins 30 jours avant', () => {
    expect(
      etapeInactivite({
        derniereActivite: new Date('2024-10-01T00:00:00.000Z'),
        avertiLe: jalon(new Date('2026-09-01T01:00:00.000Z')),
        maintenant,
      }),
    ).toEqual({ _tag: 'aSupprimer' })
  })

  it('ne supprime pas avant la fin du préavis, même au-delà de 2 ans', () => {
    expect(
      etapeInactivite({
        derniereActivite: new Date('2023-06-01T00:00:00.000Z'),
        avertiLe: jalon(new Date('2026-10-01T01:00:00.000Z')),
        maintenant,
      }),
    ).toEqual({
      _tag: 'enAttente',
      dateDeSuppression: new Date('2026-10-31T01:00:00.000Z'),
    })
  })

  it('avertit de nouveau un compte revenu après un avertissement puis redevenu inactif', () => {
    expect(
      etapeInactivite({
        derniereActivite: new Date('2024-11-10T00:00:00.000Z'),
        avertiLe: jalon(new Date('2024-09-01T00:00:00.000Z')),
        maintenant,
      }),
    ).toEqual({
      _tag: 'aAvertir',
      dateDeSuppression: new Date('2026-11-19T01:00:00.000Z'),
    })
  })
})
