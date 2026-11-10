import { getCartographyStatus } from './statut-cartographie'

describe('statut d’un lieu sur la cartographie nationale', () => {
  it.each([
    [false, null, false, 'not_visible'],
    [false, 'carto-1', true, 'not_visible'],
    [true, null, false, 'pending'],
    [true, null, true, 'pending'],
    [true, 'carto-1', false, 'visible'],
    [true, 'carto-1', true, 'updating'],
  ] as const)(
    'déclaré visible : %s, identifiant carto : %s, modifié récemment : %s → %s',
    (visiblePourCartographieNationale, structureCartographieNationaleId, hasRecentModification, attendu) => {
      expect(
        getCartographyStatus({
          visiblePourCartographieNationale,
          structureCartographieNationaleId,
          hasRecentModification,
        }),
      ).toBe(attendu)
    },
  )
})
