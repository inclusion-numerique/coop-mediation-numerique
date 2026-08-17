import { StatutPresence } from './statut-presence'
import { statutRdv } from './statut-rdv'

describe('statutRdv', () => {
  const maintenant = new Date('2026-08-17T12:00:00.000Z')
  const hier = new Date('2026-08-16T12:00:00.000Z')
  const demain = new Date('2026-08-18T12:00:00.000Z')

  it('affiche « à venir » tant que le rendez-vous n’est pas échu', () => {
    expect(statutRdv(StatutPresence('unknown'), demain, maintenant)).toBe(
      'unknown',
    )
  })

  it('affiche « passé » quand le rendez-vous est échu sans présence saisie', () => {
    expect(statutRdv(StatutPresence('unknown'), hier, maintenant)).toBe('passe')
  })

  it('bascule à « passé » dès l’instant de fin, pas une minute après', () => {
    expect(statutRdv(StatutPresence('unknown'), maintenant, maintenant)).toBe(
      'passe',
    )
  })

  it.each(['seen', 'excused', 'revoked', 'noshow'] as const)(
    'conserve le statut « %s » d’un rendez-vous échu',
    (statut) => {
      expect(statutRdv(StatutPresence(statut), hier, maintenant)).toBe(statut)
    },
  )

  it('conserve un statut saisi à l’avance', () => {
    expect(statutRdv(StatutPresence('revoked'), demain, maintenant)).toBe(
      'revoked',
    )
  })
})
