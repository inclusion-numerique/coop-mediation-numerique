import { criteresDesLieux, estFiltre } from './criteres-des-lieux'

describe('critères de l’annuaire des lieux', () => {
  it('garde la recherche, les communes valides, le tri et la page', () => {
    expect(
      criteresDesLieux({
        recherche: ' médiathèque ',
        communes: '15014,abc,2A004',
        tri: 'nomza',
        page: '2',
        lignes: '50',
      }),
    ).toEqual({
      recherche: 'médiathèque',
      communes: ['15014', '2A004'],
      tri: 'nomza',
      page: 2,
      lignes: 50,
    })
  })

  it('se replie sur la première page de 20 lieux sans critère', () => {
    expect(criteresDesLieux({})).toEqual({
      recherche: null,
      communes: [],
      tri: 'nomaz',
      page: 1,
      lignes: 20,
    })
  })

  it('n’est filtré que par une recherche ou des communes', () => {
    expect(estFiltre(criteresDesLieux({ tri: 'nomza', page: '3' }))).toBe(false)
    expect(estFiltre(criteresDesLieux({ communes: '15014' }))).toBe(true)
  })

  it('ne lit que la première valeur d’un paramètre répété', () => {
    expect(
      criteresDesLieux({
        recherche: ['médiathèque', 'mairie'],
        tri: ['inconnu'],
      }),
    ).toMatchObject({ recherche: 'médiathèque', tri: 'nomaz' })
  })
})
