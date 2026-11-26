import {
  Adresse,
  Localisation,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { IdentifiantCartographie } from '../../../domain/cartographie-nationale/ids-cartographie-nationale'
import { BanId } from '../../../domain/identifiants/ban-id'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import { ajouterDesLieuxActivite } from './ajouter-des-lieux-activite'
import type {
  LieuACreer,
  LieuDejaRattache,
  LieuDemande,
  LieuExistant,
} from './lieu-demande'

const LIEU_A = LieuId('0927f824-b84d-4840-ae2e-e4a96a7a519b')
const LIEU_B = LieuId('f98724ab-93d2-46cd-bff6-1821dd6a6da7')
const LIEU_DEJA = LieuId('00efad2c-0d71-43e3-a174-9e0c2defa083')
const AUTRE = LieuId('a6648fed-4d21-4ca4-a25b-d5a44d8ca38a')
const CARTO = IdentifiantCartographie('c-1')

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

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440001')
const utilisateurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440002')
const maintenant = new Date('2026-11-26T10:00:00Z')

const ajouter = ({
  dejaRattaches,
  demandes,
}: {
  readonly dejaRattaches: readonly LieuDejaRattache[]
  readonly demandes: readonly LieuDemande[]
}) =>
  ajouterDesLieuxActivite({
    lireLieuxDejaRattaches: async () => dejaRattaches,
    trouverStructuresCarto: async () => new Map(),
    rattacherAuxLieux: async () => [],
  })({ demandes, utilisateurId, mediateurId, maintenant })

const premier = connu({ id: LIEU_A, nom: Nom('Médiathèque') })
const second = connu({ id: LIEU_B, nom: Nom('Médiathèque') })

describe('ajouter des lieux d’activité', () => {
  it.each<{
    cas: string
    dejaRattaches: readonly LieuDejaRattache[]
    demandes: readonly LieuDemande[]
    lieux: readonly LieuDemande[]
  }>([
    {
      cas: 'retient un lieu auquel le médiateur n’exerce pas encore',
      dejaRattaches: [],
      demandes: [connu({ id: LIEU_A })],
      lieux: [connu({ id: LIEU_A })],
    },
    {
      cas: 'écarte un lieu déjà rattaché, reconnu par son identité interne',
      dejaRattaches: [rattache({ id: LIEU_A })],
      demandes: [connu({ id: LIEU_A })],
      lieux: [],
    },
    {
      cas: 'écarte un lieu déjà rattaché, reconnu par son identité de cartographie',
      dejaRattaches: [
        rattache({ id: LIEU_A, structureCartographieNationaleId: CARTO }),
      ],
      demandes: [aCreer({ structureCartographieNationaleId: CARTO })],
      lieux: [],
    },
    {
      cas: 'écarte un lieu déjà rattaché quand seule la carto du lieu demandé parle',
      dejaRattaches: [
        rattache({ id: LIEU_A, structureCartographieNationaleId: CARTO }),
      ],
      demandes: [connu({ id: AUTRE, structureCartographieNationaleId: CARTO })],
      lieux: [],
    },
    {
      cas: 'ne retient qu’une fois le même lieu du panier par son identité interne',
      dejaRattaches: [],
      demandes: [connu({ id: LIEU_A }), connu({ id: LIEU_A })],
      lieux: [connu({ id: LIEU_A })],
    },
    {
      cas: 'ne retient qu’une fois le même lieu du panier par son identité de cartographie',
      dejaRattaches: [],
      demandes: [
        aCreer({ structureCartographieNationaleId: CARTO }),
        aCreer({ structureCartographieNationaleId: CARTO }),
      ],
      lieux: [aCreer({ structureCartographieNationaleId: CARTO })],
    },
    {
      cas: 'ne retient qu’une fois le même lieu du panier par sa dénomination, faute d’identité',
      dejaRattaches: [],
      demandes: [
        aCreer({ nom: Nom('Tiers-lieu du Port') }),
        aCreer({ nom: Nom('Tiers-lieu du Port') }),
      ],
      lieux: [aCreer({ nom: Nom('Tiers-lieu du Port') })],
    },
    {
      cas: 'retient deux lieux distincts portant le même nom sous des identités différentes',
      dejaRattaches: [],
      demandes: [premier, second],
      lieux: [premier, second],
    },
    {
      cas: 'laisse passer un lieu sans aucune identité, que la persistance corrélera',
      dejaRattaches: [rattache({ id: LIEU_A })],
      demandes: [aCreer()],
      lieux: [aCreer()],
    },
  ])('$cas', async ({ dejaRattaches, demandes, lieux }) => {
    expect(await ajouter({ dejaRattaches, demandes })).toEqual({
      success: true,
      data: {
        utilisateurId,
        mediateurId,
        lieux,
        structuresCarto: new Map(),
        ajouteLe: maintenant,
        lieuxRattaches: [],
      },
    })
  })

  it('refuse un panier vide', async () => {
    expect(await ajouter({ dejaRattaches: [], demandes: [] })).toEqual({
      success: false,
      error: { _tag: 'PanierVide' },
    })
  })

  it.each<{ cas: string; demandes: readonly LieuDemande[] }>([
    { cas: 'avec un panier', demandes: [connu({ id: LIEU_A })] },
    { cas: 'même avec un panier vide', demandes: [] },
  ])('refuse un compte sans médiateur, $cas', async ({ demandes }) => {
    expect(
      await ajouterDesLieuxActivite({
        lireLieuxDejaRattaches: async () => [],
        trouverStructuresCarto: async () => new Map(),
        rattacherAuxLieux: async () => [],
      })({ demandes, utilisateurId, mediateurId: null, maintenant }),
    ).toEqual({ success: false, error: { _tag: 'MediateurRequis' } })
  })
})
