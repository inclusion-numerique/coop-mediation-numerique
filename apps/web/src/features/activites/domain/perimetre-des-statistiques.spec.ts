import { CoordinateurId } from './coordinateur-id'
import { MediateurId } from './mediateur-id'
import { perimetreDuDemandeur } from './perimetre-des-statistiques'

const MOI = MediateurId('0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e01')
const MEMBRE = MediateurId('5d7e8a90-1b2c-4d3e-8f4a-6b7c8d9e0f12')
const COORDINATEUR = CoordinateurId('9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d')

describe('périmètre des statistiques du demandeur', () => {
  it('un médiateur ne voit que ses activités', () => {
    expect(
      perimetreDuDemandeur({ mediateur: MOI, coordinateur: null, equipe: [] }),
    ).toEqual({ type: 'Mediateur', mediateur: MOI })
  })

  it('un coordinateur médiateur voit son équipe et ses propres activités, sans doublon', () => {
    expect(
      perimetreDuDemandeur({
        mediateur: MOI,
        coordinateur: COORDINATEUR,
        equipe: [MEMBRE, MOI],
      }),
    ).toEqual({
      type: 'Equipe',
      coordinateur: COORDINATEUR,
      membres: [MOI, MEMBRE],
    })
  })

  it('sans profil, aucun périmètre', () => {
    expect(
      perimetreDuDemandeur({ mediateur: null, coordinateur: null, equipe: [] }),
    ).toBeNull()
  })
})
