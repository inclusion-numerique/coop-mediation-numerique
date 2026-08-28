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
      aCloturer: [],
      aCreer: [],
    })
  })

  it('crée un lieu désiré à id interne pas encore rattaché', () => {
    const desires = [{ id: 'lieu-1', nom: 'Lieu 1' }]

    expect(reconcilierLieuxActivite([], desires)).toEqual({
      aCloturer: [],
      aCreer: [{ id: 'lieu-1', nom: 'Lieu 1' }],
    })
  })

  it('crée un lieu désiré identifié par sa carto nationale', () => {
    const desires = [
      { structureCartographieNationaleId: 'carto-1', nom: 'Lieu carto' },
    ]

    expect(reconcilierLieuxActivite([], desires)).toEqual({
      aCloturer: [],
      aCreer: [
        { structureCartographieNationaleId: 'carto-1', nom: 'Lieu carto' },
      ],
    })
  })

  it('crée un nouveau lieu nommé sans id ni carto', () => {
    const desires = [{ nom: 'Nouveau lieu' }]

    expect(reconcilierLieuxActivite([], desires)).toEqual({
      aCloturer: [],
      aCreer: [{ nom: 'Nouveau lieu' }],
    })
  })

  it('clôture une activité dont le lieu (par id interne) n’est plus désiré', () => {
    const existants = [existant('act-1', 'lieu-1')]
    const desires = [{ id: 'lieu-2', nom: 'Lieu 2' }]

    expect(reconcilierLieuxActivite(existants, desires)).toEqual({
      aCloturer: ['act-1'],
      aCreer: [{ id: 'lieu-2', nom: 'Lieu 2' }],
    })
  })

  it('clôture une activité dont le lieu (par carto) n’est plus désiré', () => {
    const existants = [existant('act-1', 'lieu-1', 'carto-1')]
    const desires = [
      { structureCartographieNationaleId: 'carto-2', nom: 'Lieu 2' },
    ]

    expect(reconcilierLieuxActivite(existants, desires)).toEqual({
      aCloturer: ['act-1'],
      aCreer: [{ structureCartographieNationaleId: 'carto-2', nom: 'Lieu 2' }],
    })
  })

  it('ne clôture pas un lieu re-soumis par son seul id interne, alors qu’il porte un id de cartographie nationale', () => {
    // La recherche coop rend l'id interne seul : un lieu retiré puis re-ajouté
    // ainsi ne doit pas être clôturé au prétexte que son id carto manque.
    const existants = [existant('act-1', 'lieu-1', 'carto-1')]
    const desires = [{ id: 'lieu-1', nom: 'Lieu 1' }]

    expect(reconcilierLieuxActivite(existants, desires)).toEqual({
      aCloturer: [],
      aCreer: [],
    })
  })

  it('ne recrée pas une activité dont le lieu est déjà rattaché par son id de cartographie nationale', () => {
    const existants = [existant('act-1', 'lieu-1', 'carto-1')]
    const desires = [
      { structureCartographieNationaleId: 'carto-1', nom: 'Lieu 1' },
    ]

    expect(reconcilierLieuxActivite(existants, desires)).toEqual({
      aCloturer: [],
      aCreer: [],
    })
  })

  it('ne crée qu’une activité pour un même lieu désiré deux fois', () => {
    const desires = [
      { id: 'lieu-1', nom: 'Lieu 1' },
      { id: 'lieu-1', nom: 'Lieu 1' },
    ]

    expect(reconcilierLieuxActivite([], desires)).toEqual({
      aCloturer: [],
      aCreer: [{ id: 'lieu-1', nom: 'Lieu 1' }],
    })
  })

  it('ne crée qu’une activité pour un même lieu de cartographie désiré deux fois', () => {
    const desires = [
      { structureCartographieNationaleId: 'carto-1', nom: 'Lieu 1' },
      { structureCartographieNationaleId: 'carto-1', nom: 'Lieu 1' },
    ]

    expect(reconcilierLieuxActivite([], desires)).toEqual({
      aCloturer: [],
      aCreer: [{ structureCartographieNationaleId: 'carto-1', nom: 'Lieu 1' }],
    })
  })

  it('ne crée qu’une activité pour un même nouveau lieu nommé deux fois', () => {
    const desires = [{ nom: 'Lieu neuf' }, { nom: 'Lieu neuf' }]

    expect(reconcilierLieuxActivite([], desires)).toEqual({
      aCloturer: [],
      aCreer: [{ nom: 'Lieu neuf' }],
    })
  })

  it('distingue deux lieux désirés que rien ne confond', () => {
    const desires = [{ id: 'lieu-1', nom: 'Lieu 1' }, { nom: 'Lieu 2' }]

    expect(reconcilierLieuxActivite([], desires)).toEqual({
      aCloturer: [],
      aCreer: [{ id: 'lieu-1', nom: 'Lieu 1' }, { nom: 'Lieu 2' }],
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
      aCloturer: [],
      aCreer: [],
    })
  })
})
