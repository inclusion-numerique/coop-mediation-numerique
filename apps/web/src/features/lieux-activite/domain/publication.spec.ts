import { publicationSansService } from './publication'

describe('la publication sur la cartographie nationale', () => {
  it('refuse un lieu visible sans service', () => {
    expect(publicationSansService(true, [])).toBe(true)
  })

  it('laisse passer un lieu visible qui annonce un service', () => {
    expect(
      publicationSansService(true, ['AideAuxDemarchesAdministratives']),
    ).toBe(false)
  })

  /** Un lieu qui ne paraît pas sur la cartographie n'a rien à y annoncer. */
  it('ne dit rien d’un lieu non publié', () => {
    expect(publicationSansService(false, [])).toBe(false)
  })

  /** La saisie de création laisse le champ absent tant qu'on n'y touche pas. */
  it.each([[null], [undefined]])(
    'traite %s comme aucun service',
    (services) => {
      expect(publicationSansService(true, services)).toBe(true)
    },
  )
})
