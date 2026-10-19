import { CoordinateurId } from './coordinateur-id'
import { peutConsulterLEquipe } from './lecteur'

const equipe = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')
const autre = CoordinateurId('550e8400-e29b-41d4-a716-446655440002')

describe('qui peut consulter une équipe', () => {
  it('un membre actif de l’équipe', () => {
    expect(
      peutConsulterLEquipe({
        gestionnaire: { type: 'Autre' },
        membreActifDeLEquipe: true,
      })(equipe),
    ).toBe(true)
  })

  it('son coordinateur', () => {
    expect(
      peutConsulterLEquipe({
        gestionnaire: { type: 'Coordinateur', coordinateurId: equipe },
        membreActifDeLEquipe: false,
      })(equipe),
    ).toBe(true)
  })

  it('mais pas le coordinateur d’une autre équipe', () => {
    expect(
      peutConsulterLEquipe({
        gestionnaire: { type: 'Coordinateur', coordinateurId: autre },
        membreActifDeLEquipe: false,
      })(equipe),
    ).toBe(false)
  })
})
