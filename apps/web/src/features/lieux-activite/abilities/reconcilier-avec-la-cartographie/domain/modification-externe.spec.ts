import { modificationExterne } from './modification-externe'

const LE_15_JANVIER = new Date('2026-01-15')

describe('trace d’une modification venue d’ailleurs', () => {
  it('trace la source quand elle n’est pas la coop et qu’elle a touché la fiche après nous', () => {
    expect(
      modificationExterne(
        {
          identifiantCartographie: 'Hinaura_Fablab__Coop-numérique_abc',
          source: 'Hinaura',
          dateMaj: new Date('2026-02-01'),
        },
        LE_15_JANVIER,
      ),
    ).toEqual({
      derniereModificationSource: 'Hinaura',
      derniereModificationParId: null,
    })
  })

  it('ne trace rien quand la source est la coop', () => {
    expect(
      modificationExterne(
        {
          identifiantCartographie: 'Coop-numérique_abc',
          source: 'Coop numérique',
          dateMaj: new Date('2026-02-01'),
        },
        LE_15_JANVIER,
      ),
    ).toBeNull()
  })

  it('ne trace rien quand la modification externe précède la nôtre', () => {
    expect(
      modificationExterne(
        {
          identifiantCartographie: 'Hinaura_Fablab__Coop-numérique_abc',
          source: 'Hinaura',
          dateMaj: new Date('2026-01-01'),
        },
        LE_15_JANVIER,
      ),
    ).toBeNull()
  })

  it('ne trace rien quand la cartographie ne date pas sa modification', () => {
    expect(
      modificationExterne(
        {
          identifiantCartographie: 'Hinaura_Fablab__Coop-numérique_abc',
          source: 'Hinaura',
          dateMaj: null,
        },
        LE_15_JANVIER,
      ),
    ).toBeNull()
  })

  it('ne trace rien quand la cartographie ne nomme pas sa source', () => {
    expect(
      modificationExterne(
        {
          identifiantCartographie: 'Coop-numérique_abc',
          source: null,
          dateMaj: new Date('2026-02-01'),
        },
        LE_15_JANVIER,
      ),
    ).toBeNull()
  })
})
