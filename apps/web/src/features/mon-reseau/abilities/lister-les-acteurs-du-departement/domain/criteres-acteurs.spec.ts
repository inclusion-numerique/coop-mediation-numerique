import { criteresActeurs, estFiltre } from './criteres-acteurs'

describe('critères de l’annuaire des acteurs', () => {
  it('garde les critères valides', () => {
    expect(
      criteresActeurs({
        recherche: ' martin ',
        role: 'coordinateur',
        communes: '15014,abc',
        tri: 'nomza',
        page: '2',
        lignes: '50',
      }),
    ).toEqual({
      recherche: 'martin',
      role: 'coordinateur',
      communes: ['15014'],
      tri: 'nomza',
      page: 2,
      lignes: 50,
    })
  })

  it('écarte un rôle inconnu et se replie sur le tri alphabétique', () => {
    expect(criteresActeurs({ role: 'administrateur', tri: 'age' })).toEqual({
      recherche: null,
      role: null,
      communes: [],
      tri: 'nomaz',
      page: 1,
      lignes: 20,
    })
  })

  it('est filtré par une recherche, un rôle ou des communes', () => {
    expect(estFiltre(criteresActeurs({ page: '2', tri: 'nomza' }))).toBe(false)
    expect(estFiltre(criteresActeurs({ role: 'coordinateur' }))).toBe(true)
  })

  it('lit des communes passées en paramètres répétés', () => {
    expect(criteresActeurs({ communes: ['15014', '15187'] }).communes).toEqual([
      '15014',
      '15187',
    ])
  })
})
