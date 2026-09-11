import { derniereModificationExterne } from './modification-du-registre'

const modificationCoop = new Date('2026-09-01T10:00:00Z')
const apres = new Date('2026-09-02T10:00:00Z')
const avant = new Date('2026-08-30T10:00:00Z')

const inscription = (
  surcharge: Partial<{
    source: string | null
    updatedAtCarto: Date | null
    updatedAtMin: Date | null
  }> = {},
) => ({
  source: 'dora',
  updatedAtCarto: apres,
  updatedAtMin: null,
  ...surcharge,
})

describe('la dernière main sur la fiche, quand elle n’est pas la nôtre', () => {
  it('nomme la source tierce qui a écrit après nous', () => {
    expect(
      derniereModificationExterne(inscription(), modificationCoop),
    ).toEqual({ _tag: 'ParSource', date: apres, source: 'dora' })
  })

  it('ne dit rien d’une source tierce qui a écrit avant nous', () => {
    expect(
      derniereModificationExterne(
        inscription({ updatedAtCarto: avant }),
        modificationCoop,
      ),
    ).toBeNull()
  })

  it('ne dit rien quand la source est la coop, même horodatée après nous', () => {
    expect(
      derniereModificationExterne(
        inscription({ source: 'Coop numérique' }),
        modificationCoop,
      ),
    ).toBeNull()
  })

  it('ne dit rien quand le registre ne nomme aucune source', () => {
    expect(
      derniereModificationExterne(
        inscription({ source: null }),
        modificationCoop,
      ),
    ).toBeNull()
    expect(
      derniereModificationExterne(
        inscription({ source: '' }),
        modificationCoop,
      ),
    ).toBeNull()
  })

  it('ne dit rien quand aucune écriture tierce n’est horodatée', () => {
    expect(
      derniereModificationExterne(
        inscription({ updatedAtCarto: null, updatedAtMin: null }),
        modificationCoop,
      ),
    ).toBeNull()
  })

  it('retient la plus récente des deux écritures tierces', () => {
    const plusRecente = new Date('2026-09-03T10:00:00Z')

    expect(
      derniereModificationExterne(
        inscription({ updatedAtCarto: apres, updatedAtMin: plusRecente }),
        modificationCoop,
      ),
    ).toEqual({ _tag: 'ParSource', date: plusRecente, source: 'dora' })
  })

  it('regarde MIN quand la carto n’a rien horodaté', () => {
    expect(
      derniereModificationExterne(
        inscription({ updatedAtCarto: null, updatedAtMin: apres }),
        modificationCoop,
      ),
    ).toEqual({ _tag: 'ParSource', date: apres, source: 'dora' })
  })
})
