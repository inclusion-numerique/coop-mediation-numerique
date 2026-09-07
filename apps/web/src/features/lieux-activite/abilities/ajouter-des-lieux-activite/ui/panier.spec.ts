import { geocodeStructureAdresse } from '@app/web/external-apis/ban/geocodeStructureAdresse'
import type { LieuActiviteSearchResult } from '../implementation/searchLieuActiviteCombined'
import {
  auPanier,
  type LieuAuPanier,
  lieuCree,
  memeLieu,
  selectionner,
} from './panier'

/**
 * Seul le géocodage est remplacé : c'est le seul appel distant du module, et
 * le message d'adresse introuvable reste celui que l'utilisateur lira.
 */
jest.mock('@app/web/external-apis/ban/geocodeStructureAdresse', () => ({
  ...jest.requireActual('@app/web/external-apis/ban/geocodeStructureAdresse'),
  geocodeStructureAdresse: jest.fn(),
}))

const geocodage = jest.mocked(geocodeStructureAdresse)

const adresseBan = {
  id: '17299_0123_00012',
  label: '12 quai du Port, 17300 Rochefort',
  nom: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  codeInsee: '17299',
  contexte: '17, Charente-Maritime',
  latitude: 45.94,
  longitude: -0.96,
}

const resultat = (
  champs: Partial<LieuActiviteSearchResult> = {},
): LieuActiviteSearchResult => ({
  id: 'carto-1',
  nom: 'Tiers-lieu du Port',
  adresse: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  codeInsee: '17299',
  complementAdresse: null,
  pivot: '13002603200016',
  typologie: null,
  latitude: 45.94,
  longitude: -0.96,
  structures: [],
  source: 'cartographie_nationale',
  ...champs,
})

const auxPanier = (champs: Partial<LieuAuPanier> = {}): LieuAuPanier => ({
  id: null,
  structureCartographieNationaleId: null,
  nom: 'Tiers-lieu du Port',
  siret: null,
  adresse: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  ...champs,
})

beforeEach(() => {
  geocodage.mockReset()
  geocodage.mockResolvedValue(adresseBan)
})

describe('deux entrées désignent le même lieu', () => {
  it('si leur identité interne coïncide', () => {
    expect(memeLieu(auxPanier({ id: 'a' }), auxPanier({ id: 'a' }))).toBe(true)
  })

  it('si leur identité de cartographie coïncide', () => {
    expect(
      memeLieu(
        auxPanier({ structureCartographieNationaleId: 'c-1' }),
        auxPanier({ structureCartographieNationaleId: 'c-1' }),
      ),
    ).toBe(true)
  })

  it('mais pas si les identités diffèrent', () => {
    expect(memeLieu(auxPanier({ id: 'a' }), auxPanier({ id: 'b' }))).toBe(false)
  })

  /** Sans identité, rien ne permet de les confondre — pas même deux absences. */
  it('ni si aucune des deux n’en porte', () => {
    expect(memeLieu(auxPanier(), auxPanier())).toBe(false)
  })
})

describe('un résultat de recherche devient une entrée du panier', () => {
  it('par son id quand la coop connaît déjà le lieu', async () => {
    const lieu = await auPanier(resultat({ structures: [{ id: 'lieu-coop' }] }))

    expect(lieu).toEqual({
      id: 'lieu-coop',
      structureCartographieNationaleId: null,
      nom: 'Tiers-lieu du Port',
      siret: '13002603200016',
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee: '17299',
    })
  })

  /** Son adresse ne sera pas réécrite : rien à géocoder. */
  it('sans interroger la Base Adresse Nationale pour un lieu déjà connu', async () => {
    await auPanier(resultat({ structures: [{ id: 'lieu-coop' }] }))

    expect(geocodage).not.toHaveBeenCalled()
  })

  it('avec l’adresse reconnue par la BAN pour un lieu à créer', async () => {
    const lieu = await auPanier(resultat())

    expect(lieu).toMatchObject({
      id: null,
      banId: '17299_0123_00012',
      latitude: 45.94,
      longitude: -0.96,
      adresse: '12 quai du Port',
    })
  })

  it('en retenant l’identité de cartographie d’un résultat qui en vient', async () => {
    const lieu = await auPanier(resultat({ source: 'cartographie_nationale' }))

    expect(lieu?.structureCartographieNationaleId).toBe('carto-1')
  })

  /**
   * La coop et l'annuaire des entreprises portent leur propre identifiant dans
   * le même champ : le prendre pour un id carto ferait chercher le lieu dans
   * l'Entrepôt, où il n'est pas.
   */
  it.each([['api'], ['structure_locale']] as const)(
    'en l’ignorant pour un résultat venu de %s',
    async (source) => {
      const lieu = await auPanier(resultat({ source }))

      expect(lieu?.structureCartographieNationaleId).toBeNull()
    },
  )

  it('rend null quand la BAN ne reconnaît pas l’adresse', async () => {
    geocodage.mockResolvedValue(null)

    expect(await auPanier(resultat())).toBeNull()
  })
})

describe('le lieu choisi rejoint la sélection', () => {
  it('quand rien ne s’y oppose', async () => {
    const issue = await selectionner([], resultat())

    expect(issue.success).toBe(true)
  })

  it('sauf si son adresse est introuvable dans la BAN', async () => {
    geocodage.mockResolvedValue(null)

    const issue = await selectionner([], resultat())

    expect(!issue.success && issue.error).toContain(
      'introuvable dans la Base Adresse Nationale',
    )
  })

  it('sauf s’il fait déjà partie de la sélection', async () => {
    const issue = await selectionner(
      [auxPanier({ structureCartographieNationaleId: 'carto-1' })],
      resultat(),
    )

    expect(!issue.success && issue.error).toBe(
      'Tiers-lieu du Port fait déjà partie de votre sélection.',
    )
  })
})

describe('le lieu qu’on vient de créer', () => {
  it('rejoint la sélection avec son id et son adresse validée', () => {
    expect(
      lieuCree({ id: 'lieu-cree', nom: 'Tiers-lieu du Port', adresseBan }),
    ).toEqual({
      id: 'lieu-cree',
      structureCartographieNationaleId: null,
      nom: 'Tiers-lieu du Port',
      siret: null,
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee: '17299',
      banId: '17299_0123_00012',
      latitude: 45.94,
      longitude: -0.96,
    })
  })
})
