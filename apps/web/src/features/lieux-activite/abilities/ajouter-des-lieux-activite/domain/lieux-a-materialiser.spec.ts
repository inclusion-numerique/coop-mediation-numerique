import type { LieuACreer, LieuDejaRattache, LieuExistant } from './lieu-demande'
import { lieuxAMaterialiser } from './lieux-a-materialiser'

/**
 * Une demande porte, ou bien l'id du lieu que la coop connaît déjà, ou bien une
 * adresse validée par la BAN : un lieu sans identité interne sera CRÉÉ, et l'on
 * ne crée plus de lieu qu'on ne saurait situer.
 */
const identite = {
  nom: 'Maison France Services',
  adresse: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
} as const

const connu = (
  partie: Partial<LieuExistant> & { id: string },
): LieuExistant => ({
  ...identite,
  ...partie,
})

const aCreer = (partie: Partial<LieuACreer> = {}): LieuACreer => ({
  ...identite,
  codeInsee: '51454',
  banId: '51454_7160_00012',
  latitude: 49.25,
  longitude: 4.03,
  ...partie,
})

const rattache = (partie: Partial<LieuDejaRattache>): LieuDejaRattache => ({
  id: 'lieu-deja',
  structureCartographieNationaleId: null,
  ...partie,
})

describe("les lieux qu'il reste à matérialiser", () => {
  it('retient un lieu auquel le médiateur n’exerce pas encore', () => {
    expect(lieuxAMaterialiser([], [connu({ id: 'lieu-a' })])).toEqual([
      connu({ id: 'lieu-a' }),
    ])
  })

  describe('écarte ce à quoi le médiateur exerce déjà', () => {
    it('reconnu par son identité interne', () => {
      expect(
        lieuxAMaterialiser(
          [rattache({ id: 'lieu-a' })],
          [connu({ id: 'lieu-a' })],
        ),
      ).toEqual([])
    })

    // Les deux identités sont indépendantes : la recherche coop rend l'id
    // interne, la cartographie le sien, et il suffit que l'une corresponde.
    it('reconnu par son identité de cartographie nationale', () => {
      expect(
        lieuxAMaterialiser(
          [rattache({ id: 'lieu-a', structureCartographieNationaleId: 'c-1' })],
          [aCreer({ structureCartographieNationaleId: 'c-1' })],
        ),
      ).toEqual([])
    })

    it('quand seule la carto du lieu demandé parle', () => {
      expect(
        lieuxAMaterialiser(
          [rattache({ id: 'lieu-a', structureCartographieNationaleId: 'c-1' })],
          [connu({ id: 'autre', structureCartographieNationaleId: 'c-1' })],
        ),
      ).toEqual([])
    })
  })

  describe('ne retient qu’une fois le même lieu du panier', () => {
    it('par son identité interne', () => {
      expect(
        lieuxAMaterialiser(
          [],
          [connu({ id: 'lieu-a' }), connu({ id: 'lieu-a' })],
        ),
      ).toEqual([connu({ id: 'lieu-a' })])
    })

    it('par son identité de cartographie', () => {
      expect(
        lieuxAMaterialiser(
          [],
          [
            aCreer({ structureCartographieNationaleId: 'c-1' }),
            aCreer({ structureCartographieNationaleId: 'c-1' }),
          ],
        ),
      ).toEqual([aCreer({ structureCartographieNationaleId: 'c-1' })])
    })

    // Rien ne les identifie encore : c'est la dénomination qui départage, la
    // persistance corrélant de toute façon sur l'adresse.
    it('par sa dénomination, faute d’identité', () => {
      expect(
        lieuxAMaterialiser(
          [],
          [
            aCreer({ nom: 'Tiers-lieu du Port' }),
            aCreer({ nom: 'Tiers-lieu du Port' }),
          ],
        ),
      ).toEqual([aCreer({ nom: 'Tiers-lieu du Port' })])
    })

    it('mais retient deux lieux distincts portant le même nom sous des identités différentes', () => {
      const premier = connu({ id: 'lieu-a', nom: 'Médiathèque' })
      const second = connu({ id: 'lieu-b', nom: 'Médiathèque' })

      expect(lieuxAMaterialiser([], [premier, second])).toEqual([
        premier,
        second,
      ])
    })
  })

  it('laisse passer un lieu sans aucune identité, que la persistance corrélera', () => {
    expect(
      lieuxAMaterialiser([rattache({ id: 'lieu-a' })], [aCreer()]),
    ).toEqual([aCreer()])
  })
})
