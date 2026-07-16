import {
  type LieuActiviteExistant,
  reconcilierLieuxActivite,
} from './reconcilier'

const existant = (
  id: string,
  lieuId: string,
  cartoId: string | null = null,
): LieuActiviteExistant => ({
  id,
  lieuInclusion: { id: lieuId, structureCartographieNationaleId: cartoId },
})

describe('reconcilierLieuxActivite', () => {
  it('ne fait rien quand le désiré correspond déjà à l’existant', () => {
    const existants = [existant('act-1', 'lieu-1')]
    const desires = [{ id: 'lieu-1', nom: 'Lieu 1' }]

    expect(reconcilierLieuxActivite(existants, desires)).toEqual({
      aClaturer: [],
      aCreer: [],
    })
  })

  it('crée un lieu désiré à id interne pas encore rattaché', () => {
    const desires = [{ id: 'lieu-1', nom: 'Lieu 1' }]

    expect(reconcilierLieuxActivite([], desires)).toEqual({
      aClaturer: [],
      aCreer: [{ id: 'lieu-1', nom: 'Lieu 1' }],
    })
  })

  it('crée un lieu désiré identifié par sa carto nationale', () => {
    const desires = [
      { structureCartographieNationaleId: 'carto-1', nom: 'Lieu carto' },
    ]

    expect(reconcilierLieuxActivite([], desires)).toEqual({
      aClaturer: [],
      aCreer: [
        { structureCartographieNationaleId: 'carto-1', nom: 'Lieu carto' },
      ],
    })
  })

  it('crée un nouveau lieu nommé sans id ni carto', () => {
    const desires = [{ nom: 'Nouveau lieu' }]

    expect(reconcilierLieuxActivite([], desires)).toEqual({
      aClaturer: [],
      aCreer: [{ nom: 'Nouveau lieu' }],
    })
  })

  it('clôture une activité dont le lieu (par id interne) n’est plus désiré', () => {
    const existants = [existant('act-1', 'lieu-1')]
    const desires = [{ id: 'lieu-2', nom: 'Lieu 2' }]

    expect(reconcilierLieuxActivite(existants, desires)).toEqual({
      aClaturer: ['act-1'],
      aCreer: [{ id: 'lieu-2', nom: 'Lieu 2' }],
    })
  })

  it('clôture une activité dont le lieu (par carto) n’est plus désiré', () => {
    const existants = [existant('act-1', 'lieu-1', 'carto-1')]
    const desires = [
      { structureCartographieNationaleId: 'carto-2', nom: 'Lieu 2' },
    ]

    expect(reconcilierLieuxActivite(existants, desires)).toEqual({
      aClaturer: ['act-1'],
      aCreer: [{ structureCartographieNationaleId: 'carto-2', nom: 'Lieu 2' }],
    })
  })

  it('ne recrée pas une activité existante re-soumise avec son id de lieu', () => {
    const existants = [existant('act-1', 'lieu-1', 'carto-1')]
    const desires = [
      {
        id: 'lieu-1',
        structureCartographieNationaleId: 'carto-1',
        nom: 'Lieu 1',
      },
    ]

    expect(reconcilierLieuxActivite(existants, desires)).toEqual({
      aClaturer: [],
      aCreer: [],
    })
  })
})
