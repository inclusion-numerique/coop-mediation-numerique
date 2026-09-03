import type { LieuDejaRattache, LieuDemande } from './lieu-demande'
import { lieuxAMaterialiser } from './lieux-a-materialiser'

const demande = (partie: Partial<LieuDemande>): LieuDemande => ({
  nom: 'Maison France Services',
  adresse: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  ...partie,
})

const rattache = (partie: Partial<LieuDejaRattache>): LieuDejaRattache => ({
  id: 'lieu-deja',
  structureCartographieNationaleId: null,
  ...partie,
})

describe("les lieux qu'il reste à matérialiser", () => {
  it('retient un lieu auquel le médiateur n’exerce pas encore', () => {
    expect(lieuxAMaterialiser([], [demande({ id: 'lieu-a' })])).toEqual([
      demande({ id: 'lieu-a' }),
    ])
  })

  describe('écarte ce à quoi le médiateur exerce déjà', () => {
    it('reconnu par son identité interne', () => {
      expect(
        lieuxAMaterialiser(
          [rattache({ id: 'lieu-a' })],
          [demande({ id: 'lieu-a' })],
        ),
      ).toEqual([])
    })

    // Les deux identités sont indépendantes : la recherche coop rend l'id
    // interne, la cartographie le sien, et il suffit que l'une corresponde.
    it('reconnu par son identité de cartographie nationale', () => {
      expect(
        lieuxAMaterialiser(
          [rattache({ id: 'lieu-a', structureCartographieNationaleId: 'c-1' })],
          [demande({ structureCartographieNationaleId: 'c-1' })],
        ),
      ).toEqual([])
    })

    it('quand seule la carto du lieu demandé parle', () => {
      expect(
        lieuxAMaterialiser(
          [rattache({ id: 'lieu-a', structureCartographieNationaleId: 'c-1' })],
          [demande({ id: 'autre', structureCartographieNationaleId: 'c-1' })],
        ),
      ).toEqual([])
    })
  })

  describe('ne retient qu’une fois le même lieu du panier', () => {
    it('par son identité interne', () => {
      expect(
        lieuxAMaterialiser(
          [],
          [demande({ id: 'lieu-a' }), demande({ id: 'lieu-a' })],
        ),
      ).toEqual([demande({ id: 'lieu-a' })])
    })

    it('par son identité de cartographie', () => {
      expect(
        lieuxAMaterialiser(
          [],
          [
            demande({ structureCartographieNationaleId: 'c-1' }),
            demande({ structureCartographieNationaleId: 'c-1' }),
          ],
        ),
      ).toEqual([demande({ structureCartographieNationaleId: 'c-1' })])
    })

    // Rien ne les identifie encore : c'est la dénomination qui départage, la
    // persistance corrélant de toute façon sur l'adresse.
    it('par sa dénomination, faute d’identité', () => {
      expect(
        lieuxAMaterialiser(
          [],
          [
            demande({ nom: 'Tiers-lieu du Port' }),
            demande({ nom: 'Tiers-lieu du Port' }),
          ],
        ),
      ).toEqual([demande({ nom: 'Tiers-lieu du Port' })])
    })

    it('mais retient deux lieux distincts portant le même nom sous des identités différentes', () => {
      const premier = demande({ id: 'lieu-a', nom: 'Médiathèque' })
      const second = demande({ id: 'lieu-b', nom: 'Médiathèque' })

      expect(lieuxAMaterialiser([], [premier, second])).toEqual([
        premier,
        second,
      ])
    })
  })

  it('laisse passer un lieu sans aucune identité, que la persistance corrélera', () => {
    expect(
      lieuxAMaterialiser([rattache({ id: 'lieu-a' })], [demande({})]),
    ).toEqual([demande({})])
  })
})
