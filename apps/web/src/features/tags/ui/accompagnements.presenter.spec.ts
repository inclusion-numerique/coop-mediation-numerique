import { infobulleDesAccompagnements } from './accompagnements.presenter'

describe('infobulleDesAccompagnements', () => {
  it.each([
    [0, 'Aucun accompagnement n’est lié à ce tag'],
    [1, '1 accompagnement est lié à ce tag'],
    [2, '2 accompagnements sont liés à ce tag'],
  ])('annonce %i accompagnement(s)', (accompagnements, attendu) => {
    expect(infobulleDesAccompagnements(accompagnements)).toBe(attendu)
  })
})
