import {
  Adresse,
  Localisation,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { BanId } from '../../../domain/ban-id'
import { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'
import { LieuId } from '../../../domain/lieu-id'
import type { LieuACreer, LieuDejaRattache, LieuExistant } from './lieu-demande'
import { lieuxAMaterialiser } from './lieux-a-materialiser'

const LIEU_A = LieuId('0927f824-b84d-4840-ae2e-e4a96a7a519b')
const LIEU_B = LieuId('f98724ab-93d2-46cd-bff6-1821dd6a6da7')
const LIEU_DEJA = LieuId('00efad2c-0d71-43e3-a174-9e0c2defa083')
const AUTRE = LieuId('a6648fed-4d21-4ca4-a25b-d5a44d8ca38a')
const CARTO = IdentifiantCartographie('c-1')

/**
 * Une demande porte, ou bien l'id du lieu que la coop connaît déjà, ou bien une
 * adresse validée par la BAN : un lieu sans identité interne sera CRÉÉ, et l'on
 * ne crée plus de lieu qu'on ne saurait situer.
 */
const identite = { nom: Nom('Maison France Services') }

const connu = (
  partie: Partial<LieuExistant> & { id: LieuId },
): LieuExistant => ({
  ...identite,
  ...partie,
})

const aCreer = (partie: Partial<LieuACreer> = {}): LieuACreer => ({
  ...identite,
  adresse: Adresse({
    voie: '12 rue de la Paix',
    commune: 'Reims',
    code_postal: '51100',
    code_insee: '51454',
  }),
  localisation: Localisation({ latitude: 49.25, longitude: 4.03 }),
  banId: BanId('51454_7160_00012'),
  ...partie,
})

const rattache = (partie: Partial<LieuDejaRattache>): LieuDejaRattache => ({
  id: LIEU_DEJA,
  structureCartographieNationaleId: null,
  ...partie,
})

describe("les lieux qu'il reste à matérialiser", () => {
  it('retient un lieu auquel le médiateur n’exerce pas encore', () => {
    expect(lieuxAMaterialiser([], [connu({ id: LIEU_A })])).toEqual([
      connu({ id: LIEU_A }),
    ])
  })

  describe('écarte ce à quoi le médiateur exerce déjà', () => {
    it('reconnu par son identité interne', () => {
      expect(
        lieuxAMaterialiser([rattache({ id: LIEU_A })], [connu({ id: LIEU_A })]),
      ).toEqual([])
    })

    // Les deux identités sont indépendantes : la recherche coop rend l'id
    // interne, la cartographie le sien, et il suffit que l'une corresponde.
    it('reconnu par son identité de cartographie nationale', () => {
      expect(
        lieuxAMaterialiser(
          [rattache({ id: LIEU_A, structureCartographieNationaleId: CARTO })],
          [aCreer({ structureCartographieNationaleId: CARTO })],
        ),
      ).toEqual([])
    })

    it('quand seule la carto du lieu demandé parle', () => {
      expect(
        lieuxAMaterialiser(
          [rattache({ id: LIEU_A, structureCartographieNationaleId: CARTO })],
          [connu({ id: AUTRE, structureCartographieNationaleId: CARTO })],
        ),
      ).toEqual([])
    })
  })

  describe('ne retient qu’une fois le même lieu du panier', () => {
    it('par son identité interne', () => {
      expect(
        lieuxAMaterialiser([], [connu({ id: LIEU_A }), connu({ id: LIEU_A })]),
      ).toEqual([connu({ id: LIEU_A })])
    })

    it('par son identité de cartographie', () => {
      expect(
        lieuxAMaterialiser(
          [],
          [
            aCreer({ structureCartographieNationaleId: CARTO }),
            aCreer({ structureCartographieNationaleId: CARTO }),
          ],
        ),
      ).toEqual([aCreer({ structureCartographieNationaleId: CARTO })])
    })

    // Rien ne les identifie encore : c'est la dénomination qui départage, la
    // persistance corrélant de toute façon sur l'adresse.
    it('par sa dénomination, faute d’identité', () => {
      expect(
        lieuxAMaterialiser(
          [],
          [
            aCreer({ nom: Nom('Tiers-lieu du Port') }),
            aCreer({ nom: Nom('Tiers-lieu du Port') }),
          ],
        ),
      ).toEqual([aCreer({ nom: Nom('Tiers-lieu du Port') })])
    })

    it('mais retient deux lieux distincts portant le même nom sous des identités différentes', () => {
      const premier = connu({ id: LIEU_A, nom: Nom('Médiathèque') })
      const second = connu({ id: LIEU_B, nom: Nom('Médiathèque') })

      expect(lieuxAMaterialiser([], [premier, second])).toEqual([
        premier,
        second,
      ])
    })
  })

  it('laisse passer un lieu sans aucune identité, que la persistance corrélera', () => {
    expect(lieuxAMaterialiser([rattache({ id: LIEU_A })], [aCreer()])).toEqual([
      aCreer(),
    ])
  })
})
