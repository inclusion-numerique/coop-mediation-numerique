import { depuisLePanier } from './depuis-le-panier'

const lieuSoumis = (champs: Record<string, unknown> = {}) => ({
  id: null,
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
  ...champs,
})

const CONNU = '0927f824-b84d-4840-ae2e-e4a96a7a519b'

describe('le panier soumis devient une liste de demandes', () => {
  describe('un lieu que la coop connaît déjà', () => {
    it('se rattache par son id, sans exiger d’adresse validée', () => {
      const issue = depuisLePanier([
        lieuSoumis({ id: CONNU, codeInsee: null, banId: null, latitude: null }),
      ])

      expect(issue.success).toBe(true)
      expect(issue.success && issue.data).toEqual([
        {
          id: CONNU,
          nom: 'Tiers-lieu du Port',
          siret: null,
          structureCartographieNationaleId: null,
        },
      ])
    })
  })

  describe('un lieu qu’il faudra créer', () => {
    it('emporte son adresse, sa localisation et son identifiant BAN', () => {
      const issue = depuisLePanier([lieuSoumis()])

      expect(issue.success && issue.data.at(0)).toMatchObject({
        nom: 'Tiers-lieu du Port',
        banId: '17299_0123_00012',
        localisation: { latitude: 45.94, longitude: -0.96 },
        adresse: {
          voie: '12 quai du Port',
          commune: 'Rochefort',
          code_postal: '17300',
          code_insee: '17299',
        },
      })
    })

    it.each([
      ['sans code INSEE', { codeInsee: null }],
      ['sans identifiant BAN', { banId: null }],
      ['sans latitude', { latitude: null }],
      ['sans longitude', { longitude: null }],
    ])('est refusé %s', (_, manque) => {
      const issue = depuisLePanier([lieuSoumis(manque)])

      expect(issue.success).toBe(false)
      expect(!issue.success && issue.error).toEqual({
        _tag: 'AdresseNonValidee',
        nom: 'Tiers-lieu du Port',
      })
    })

    it('retient le SIRET et l’identité de cartographie soumis', () => {
      const issue = depuisLePanier([
        lieuSoumis({
          siret: '13002603200016',
          structureCartographieNationaleId: 'dora__abc',
        }),
      ])

      expect(issue.success && issue.data.at(0)).toMatchObject({
        siret: '13002603200016',
        structureCartographieNationaleId: 'dora__abc',
      })
    })
  })

  describe('un panier de plusieurs lieux', () => {
    it('conserve l’ordre de la sélection', () => {
      const issue = depuisLePanier([
        lieuSoumis({ nom: 'Premier' }),
        lieuSoumis({ nom: 'Deuxième' }),
      ])

      expect(issue.success && issue.data.map(({ nom }) => nom)).toEqual([
        'Premier',
        'Deuxième',
      ])
    })

    it('est refusé en entier dès qu’un seul lieu n’est pas situable', () => {
      const issue = depuisLePanier([
        lieuSoumis({ nom: 'Premier' }),
        lieuSoumis({ nom: 'Deuxième', codeInsee: null }),
        lieuSoumis({ nom: 'Troisième' }),
      ])

      expect(!issue.success && issue.error).toEqual({
        _tag: 'AdresseNonValidee',
        nom: 'Deuxième',
      })
    })
  })

  it('rend une liste vide pour un panier vide', () => {
    const issue = depuisLePanier([])

    expect(issue.success && issue.data).toEqual([])
  })
})
