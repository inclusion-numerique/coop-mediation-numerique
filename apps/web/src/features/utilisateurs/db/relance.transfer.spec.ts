import { Relance, relances } from '../domain'
import { relanceFromDomain, relanceToDomain } from './relance.transfer'

describe('relance en base', () => {
  it.each(
    (['Inscription', 'Nouveau'] as const).flatMap((phase) =>
      relances.map((valeur) => [phase, valeur] as const),
    ),
  )('fait l’aller-retour de la relance en phase %s : %s', (phase, valeur) => {
    const relance = Relance(valeur)
    expect(relanceToDomain(phase, relanceFromDomain(phase, relance))).toBe(
      relance,
    )
  })

  it('ignore en phase nouveau une relance restée de l’inscription', () => {
    expect(relanceToDomain('Nouveau', 'reminder_j30_sent')).toBe('Aucune')
  })

  it('ignore en phase inscription une relance de la phase nouveau', () => {
    expect(relanceToDomain('Inscription', 'nouveau_j7_sent')).toBe('Aucune')
  })
})
