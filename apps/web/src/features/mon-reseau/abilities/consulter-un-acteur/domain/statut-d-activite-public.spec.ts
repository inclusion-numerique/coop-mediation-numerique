import { statutDActivitePublic } from './statut-d-activite-public'

const maintenant = new Date('2026-10-23T12:00:00Z')

describe('statut d’activité public', () => {
  it('est actif avec une activité dans les 30 derniers jours', () => {
    expect(
      statutDActivitePublic(
        { _tag: 'Le', date: new Date('2026-10-01T12:00:00Z') },
        maintenant,
      ),
    ).toEqual({ _tag: 'Actif' })
  })

  it('est inactif depuis sa dernière activité au-delà de 30 jours', () => {
    expect(
      statutDActivitePublic(
        { _tag: 'Le', date: new Date('2026-09-01T12:00:00Z') },
        maintenant,
      ),
    ).toEqual({
      _tag: 'InactifDepuis',
      derniereActivite: new Date('2026-09-01T12:00:00Z'),
    })
  })

  it('n’a jamais été actif sans aucune activité', () => {
    expect(statutDActivitePublic({ _tag: 'Jamais' }, maintenant)).toEqual({
      _tag: 'JamaisActif',
    })
  })
})
