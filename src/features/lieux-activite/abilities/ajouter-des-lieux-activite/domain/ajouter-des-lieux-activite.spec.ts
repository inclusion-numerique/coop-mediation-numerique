import {
  Adresse,
  Contact,
  DispositifProgrammesNationaux,
  FormationsLabels,
  FraisACharge,
  Itinerances,
  Localisation,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Services,
  Typologie,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import {
  IdentifiantCartographie,
  IdsCartographieNationale,
} from '../../../domain/cartographie-nationale/ids-cartographie-nationale'
import { VisibiliteCartographie } from '../../../domain/cartographie-nationale/visibilite-cartographie'
import type {
  DestinationDuLieu,
  LieuCandidatCoop,
} from '../../../domain/destination-du-lieu'
import type { Fiche } from '../../../domain/fiche'
import { BanId } from '../../../domain/identifiants/ban-id'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { CreationDemandee } from '../../../domain/rattachement/creation-demandee'
import type { LieuCarto } from '../../../domain/rattachement/lieu-carto'
import type {
  LieuACreer,
  LieuExistant,
} from '../../../domain/rattachement/lieu-demande'
import { SourceCartographie } from '../../../domain/registre/tracabilite'
import { ajouterDesLieuxActivite } from './ajouter-des-lieux-activite'
import type { LieuDejaRattache } from './lieu-deja-rattache'
import type { LieuSoumis } from './lieu-soumis'
import type { AjouterDesLieuxActivitePorts } from './ports'

const LIEU_A = LieuId('0927f824-b84d-4840-ae2e-e4a96a7a519b')
const LIEU_B = LieuId('f98724ab-93d2-46cd-bff6-1821dd6a6da7')
const LIEU_DEJA = LieuId('00efad2c-0d71-43e3-a174-9e0c2defa083')
const AUTRE = LieuId('a6648fed-4d21-4ca4-a25b-d5a44d8ca38a')
const PORTEUR = LieuId('3c1b6c5e-7c1f-4a8e-9d55-0b6a2f1e9a10')
const CANDIDAT = LieuId('8d9e2f4a-5b6c-4d7e-8f90-1a2b3c4d5e6f')
const NOUVEAU = LieuId('6f1e2d3c-4b5a-4987-8a6b-5c4d3e2f1a0b')
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

const aNantes = aCreer({
  nom: Nom('Médiathèque'),
  adresse: Adresse({
    voie: '4 rue de la Distillerie',
    commune: 'Nantes',
    code_postal: '44000',
    code_insee: '44109',
  }),
  localisation: Localisation({ latitude: 47.218, longitude: -1.554 }),
})

const sansCodeInsee = aCreer({
  adresse: Adresse({
    voie: '12 rue de la Paix',
    commune: 'Reims',
    code_postal: '51100',
  }),
})

const annexe = aCreer({ nom: Nom('Maison France Services Annexe') })

const rattache = (partie: Partial<LieuDejaRattache>): LieuDejaRattache => ({
  id: LIEU_DEJA,
  structureCartographieNationaleId: null,
  ...partie,
})

const candidat = (suppression: Date | null): LieuCandidatCoop => ({
  id: CANDIDAT,
  nom: 'Maison France Services',
  adresse: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  latitude: 49.25,
  longitude: 4.03,
  suppression,
})

const fiche: Fiche = {
  nom: Nom('Tiers-lieu du Port'),
  pivot: null,
  adresse: null,
  localisation: null,
  typologies: Typologies([Typologie.TIERS_LIEUX]),
  contact: Contact({}),
  horaires: null,
  presentation: null,
  services: Services([]),
  publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses([]),
  priseEnChargeSpecifique: PrisesEnChargeSpecifiques([]),
  modalitesAcces: ModalitesAcces([]),
  fraisACharge: FraisACharge([]),
  itinerance: Itinerances([]),
  dispositifProgrammesNationaux: DispositifProgrammesNationaux([]),
  formationsLabels: FormationsLabels([]),
  autresFormationsLabels: [],
  modalitesAccompagnement: ModalitesAccompagnement([]),
  ficheAccesLibre: null,
  priseRdv: null,
}

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440001')
const utilisateurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440002')
const maintenant = new Date('2026-11-26T10:00:00Z')
const supprimeLe = new Date('2026-01-15T10:00:00Z')

const ports: AjouterDesLieuxActivitePorts = {
  lireLieuxDejaRattaches: async () => [],
  trouverStructuresCarto: async () => new Map(),
  etatDuLieu: async () => 'Actif',
  lieuPorteurDeLaCarto: async () => null,
  lieuxAuMemeEndroit: async () => [],
  nouvelIdentifiantDeLieu: () => NOUVEAU,
  rattacherAuxLieux: async () => ({ _tag: 'Rattaches' }),
}

const premier = connu({ id: LIEU_A, nom: Nom('Médiathèque') })
const second = connu({ id: LIEU_B, nom: Nom('Médiathèque') })

const lieuCarto = (source: SourceCartographie | null): LieuCarto => ({
  idsCartographieNationale: IdsCartographieNationale('dora__abc'),
  source,
  fiche,
})

describe('ajouter des lieux d’activité', () => {
  it.each<{
    cas: string
    dejaRattaches: readonly LieuDejaRattache[]
    demandes: readonly LieuSoumis[]
    destinations: readonly DestinationDuLieu<CreationDemandee>[]
    lieuxRattaches: readonly LieuId[]
  }>([
    {
      cas: 'rattache un lieu auquel le médiateur n’exerce pas encore',
      dejaRattaches: [],
      demandes: [connu({ id: LIEU_A })],
      destinations: [{ _tag: 'LieuActif', id: LIEU_A }],
      lieuxRattaches: [LIEU_A],
    },
    {
      cas: 'écarte un lieu déjà rattaché, reconnu par son identité interne',
      dejaRattaches: [rattache({ id: LIEU_A })],
      demandes: [connu({ id: LIEU_A })],
      destinations: [],
      lieuxRattaches: [],
    },
    {
      cas: 'écarte un lieu déjà rattaché, reconnu par son identité de cartographie',
      dejaRattaches: [
        rattache({ id: LIEU_A, structureCartographieNationaleId: CARTO }),
      ],
      demandes: [aCreer({ structureCartographieNationaleId: CARTO })],
      destinations: [],
      lieuxRattaches: [],
    },
    {
      cas: 'écarte un lieu déjà rattaché quand seule la carto du lieu demandé parle',
      dejaRattaches: [
        rattache({ id: LIEU_A, structureCartographieNationaleId: CARTO }),
      ],
      demandes: [connu({ id: AUTRE, structureCartographieNationaleId: CARTO })],
      destinations: [],
      lieuxRattaches: [],
    },
    {
      cas: 'ne rattache qu’une fois le même lieu du panier par son identité interne',
      dejaRattaches: [],
      demandes: [connu({ id: LIEU_A }), connu({ id: LIEU_A })],
      destinations: [{ _tag: 'LieuActif', id: LIEU_A }],
      lieuxRattaches: [LIEU_A],
    },
    {
      cas: 'ne crée qu’une fois le même lieu du panier par son identité de cartographie',
      dejaRattaches: [],
      demandes: [
        aCreer({ structureCartographieNationaleId: CARTO }),
        aCreer({ structureCartographieNationaleId: CARTO }),
      ],
      destinations: [
        {
          _tag: 'LieuACreer',
          id: NOUVEAU,
          creation: {
            demande: aCreer({ structureCartographieNationaleId: CARTO }),
            carto: null,
          },
        },
      ],
      lieuxRattaches: [NOUVEAU],
    },
    {
      cas: 'ne crée qu’une fois le même lieu du panier par sa dénomination, faute d’identité',
      dejaRattaches: [],
      demandes: [
        aCreer({ nom: Nom('Tiers-lieu du Port') }),
        aCreer({ nom: Nom('Tiers-lieu du Port') }),
      ],
      destinations: [
        {
          _tag: 'LieuACreer',
          id: NOUVEAU,
          creation: {
            demande: aCreer({ nom: Nom('Tiers-lieu du Port') }),
            carto: null,
          },
        },
      ],
      lieuxRattaches: [NOUVEAU],
    },
    {
      cas: 'rattache deux lieux distincts portant le même nom sous des identités différentes',
      dejaRattaches: [],
      demandes: [premier, second],
      destinations: [
        { _tag: 'LieuActif', id: LIEU_A },
        { _tag: 'LieuActif', id: LIEU_B },
      ],
      lieuxRattaches: [LIEU_A, LIEU_B],
    },
    {
      cas: 'crée un lieu sans aucune identité que la coop ne connaît pas',
      dejaRattaches: [rattache({ id: LIEU_A })],
      demandes: [aCreer()],
      destinations: [
        {
          _tag: 'LieuACreer',
          id: NOUVEAU,
          creation: { demande: aCreer(), carto: null },
        },
      ],
      lieuxRattaches: [NOUVEAU],
    },
    {
      cas: 'crée deux lieux nouveaux situés dans deux communes différentes',
      dejaRattaches: [],
      demandes: [aCreer(), aNantes],
      destinations: [
        {
          _tag: 'LieuACreer',
          id: NOUVEAU,
          creation: { demande: aCreer(), carto: null },
        },
        {
          _tag: 'LieuACreer',
          id: NOUVEAU,
          creation: { demande: aNantes, carto: null },
        },
      ],
      lieuxRattaches: [NOUVEAU, NOUVEAU],
    },
    {
      cas: 'rattache au lieu créé plus tôt dans le panier un second lieu qui désigne le même endroit',
      dejaRattaches: [],
      demandes: [aCreer(), annexe],
      destinations: [
        {
          _tag: 'LieuACreer',
          id: NOUVEAU,
          creation: { demande: aCreer(), carto: null },
        },
        { _tag: 'LieuPrevu', id: NOUVEAU },
      ],
      lieuxRattaches: [NOUVEAU, NOUVEAU],
    },
  ])(
    '$cas',
    async ({ dejaRattaches, demandes, destinations, lieuxRattaches }) => {
      expect(
        await ajouterDesLieuxActivite({
          ...ports,
          lireLieuxDejaRattaches: async () => dejaRattaches,
        })({ demandes, utilisateurId, mediateurId, maintenant }),
      ).toEqual(
        success({
          utilisateurId,
          mediateurId,
          destinations,
          ajouteLe: maintenant,
          lieuxRattaches,
        }),
      )
    },
  )

  it.each<{
    cas: string
    ports: Partial<AjouterDesLieuxActivitePorts>
    demandes: readonly LieuSoumis[]
    destinations: readonly DestinationDuLieu<CreationDemandee>[]
    lieuxRattaches: readonly LieuId[]
  }>([
    {
      cas: 'rattache au lieu porteur de la carto un lieu désigné qui n’est plus actif',
      lieuxRattaches: [PORTEUR],
      ports: {
        etatDuLieu: async () => 'Inactif',
        lieuPorteurDeLaCarto: async () => PORTEUR,
      },
      demandes: [
        connu({ id: LIEU_A, structureCartographieNationaleId: CARTO }),
      ],
      destinations: [{ _tag: 'LieuActif', id: PORTEUR }],
    },
    {
      cas: 'relève et rattache un lieu désigné qui n’est plus actif et que la carto ne porte pas',
      lieuxRattaches: [LIEU_A],
      ports: { etatDuLieu: async () => 'Inactif' },
      demandes: [connu({ id: LIEU_A })],
      destinations: [{ _tag: 'LieuARelever', id: LIEU_A }],
    },
    {
      cas: 'rattache au lieu porteur de la carto un lieu à créer depuis la carto',
      lieuxRattaches: [PORTEUR],
      ports: { lieuPorteurDeLaCarto: async () => PORTEUR },
      demandes: [aCreer({ structureCartographieNationaleId: CARTO })],
      destinations: [{ _tag: 'LieuActif', id: PORTEUR }],
    },
    {
      cas: 'rattache au lieu actif de la coop qui désigne le même endroit',
      lieuxRattaches: [CANDIDAT],
      ports: { lieuxAuMemeEndroit: async () => [candidat(null)] },
      demandes: [aCreer()],
      destinations: [{ _tag: 'LieuActif', id: CANDIDAT }],
    },
    {
      cas: 'relève le lieu supprimé qui porte exactement la même dénomination au même endroit',
      lieuxRattaches: [CANDIDAT],
      ports: { lieuxAuMemeEndroit: async () => [candidat(supprimeLe)] },
      demandes: [aCreer()],
      destinations: [{ _tag: 'LieuARelever', id: CANDIDAT }],
    },
    {
      cas: 'crée un lieu plutôt que de relever un lieu supprimé à la dénomination seulement proche',
      lieuxRattaches: [NOUVEAU],
      ports: { lieuxAuMemeEndroit: async () => [candidat(supprimeLe)] },
      demandes: [annexe],
      destinations: [
        {
          _tag: 'LieuACreer',
          id: NOUVEAU,
          creation: { demande: annexe, carto: null },
        },
      ],
    },
    {
      cas: 'ne cherche pas de lieu au même endroit sans code INSEE',
      lieuxRattaches: [NOUVEAU],
      ports: { lieuxAuMemeEndroit: async () => [candidat(null)] },
      demandes: [sansCodeInsee],
      destinations: [
        {
          _tag: 'LieuACreer',
          id: NOUVEAU,
          creation: { demande: sansCodeInsee, carto: null },
        },
      ],
    },
    {
      cas: 'rattache au lieu relevé plus tôt dans le panier un second lieu qui désigne le même endroit',
      lieuxRattaches: [CANDIDAT, CANDIDAT],
      ports: { lieuxAuMemeEndroit: async () => [candidat(supprimeLe)] },
      demandes: [aCreer(), annexe],
      destinations: [
        { _tag: 'LieuARelever', id: CANDIDAT },
        { _tag: 'LieuPrevu', id: CANDIDAT },
      ],
    },
    {
      cas: 'crée depuis la carto, sans auteur de modification, un lieu que la carto décrit sans producteur',
      lieuxRattaches: [NOUVEAU],
      ports: {
        trouverStructuresCarto: async () => new Map([[CARTO, lieuCarto(null)]]),
      },
      demandes: [aCreer({ structureCartographieNationaleId: CARTO })],
      destinations: [
        {
          _tag: 'LieuACreer',
          id: NOUVEAU,
          creation: {
            demande: aCreer({ structureCartographieNationaleId: CARTO }),
            carto: {
              id: NOUVEAU,
              fiche,
              visibilite: VisibiliteCartographie('Publie'),
              idsCartographieNationale: IdsCartographieNationale('dora__abc'),
              banId: null,
              identiteSirene: { nomUsage: null, synchronisation: null },
              tracabilite: {
                creation: { date: maintenant, par: null },
                derniereModification: { _tag: 'Inconnue', date: maintenant },
                suppression: { _tag: 'Actif' },
              },
            },
          },
        },
      ],
    },
    {
      cas: 'crée depuis la carto un lieu signé par le producteur qui l’a écrit en dernier',
      lieuxRattaches: [NOUVEAU],
      ports: {
        trouverStructuresCarto: async () =>
          new Map([[CARTO, lieuCarto(SourceCartographie('dora'))]]),
      },
      demandes: [aCreer({ structureCartographieNationaleId: CARTO })],
      destinations: [
        {
          _tag: 'LieuACreer',
          id: NOUVEAU,
          creation: {
            demande: aCreer({ structureCartographieNationaleId: CARTO }),
            carto: {
              id: NOUVEAU,
              fiche,
              visibilite: VisibiliteCartographie('Publie'),
              idsCartographieNationale: IdsCartographieNationale('dora__abc'),
              banId: null,
              identiteSirene: { nomUsage: null, synchronisation: null },
              tracabilite: {
                creation: { date: maintenant, par: null },
                derniereModification: {
                  _tag: 'ParSource',
                  date: maintenant,
                  source: SourceCartographie('dora'),
                },
                suppression: { _tag: 'Actif' },
              },
            },
          },
        },
      ],
    },
  ])(
    '$cas',
    async ({ ports: partie, demandes, destinations, lieuxRattaches }) => {
      expect(
        await ajouterDesLieuxActivite({ ...ports, ...partie })({
          demandes,
          utilisateurId,
          mediateurId,
          maintenant,
        }),
      ).toEqual(
        success({
          utilisateurId,
          mediateurId,
          destinations,
          ajouteLe: maintenant,
          lieuxRattaches,
        }),
      )
    },
  )

  it('refuse un lieu désigné qui n’existe plus et que la carto ne porte pas', async () => {
    expect(
      await ajouterDesLieuxActivite({
        ...ports,
        etatDuLieu: async () => null,
      })({
        demandes: [connu({ id: LIEU_A }), aCreer()],
        utilisateurId,
        mediateurId,
        maintenant,
      }),
    ).toEqual(failure({ _tag: 'LieuIntrouvable', lieuId: LIEU_A }))
  })

  it('refuse l’ajout quand un lieu a disparu avant le rattachement', async () => {
    expect(
      await ajouterDesLieuxActivite({
        ...ports,
        rattacherAuxLieux: async () => ({
          _tag: 'LieuDisparu',
          lieuId: LIEU_A,
        }),
      })({
        demandes: [connu({ id: LIEU_A })],
        utilisateurId,
        mediateurId,
        maintenant,
      }),
    ).toEqual(failure({ _tag: 'LieuIntrouvable', lieuId: LIEU_A }))
  })

  it.each<{ cas: string; manque: Partial<LieuSoumis>; nom: string }>([
    {
      cas: 'refuse un lieu à créer sans adresse validée',
      manque: { adresse: null },
      nom: 'Maison France Services',
    },
    {
      cas: 'refuse un lieu à créer sans localisation',
      manque: { localisation: null },
      nom: 'Maison France Services',
    },
    {
      cas: 'refuse un lieu à créer sans identifiant BAN',
      manque: { banId: null },
      nom: 'Maison France Services',
    },
  ])('$cas', async ({ manque, nom }) => {
    expect(
      await ajouterDesLieuxActivite(ports)({
        demandes: [connu({ id: LIEU_A }), { ...aCreer(), ...manque }],
        utilisateurId,
        mediateurId,
        maintenant,
      }),
    ).toEqual(failure({ _tag: 'AdresseNonValidee', nom }))
  })

  it('signale le premier lieu dont l’adresse n’est pas validée', async () => {
    expect(
      await ajouterDesLieuxActivite(ports)({
        demandes: [
          { ...aCreer({ nom: Nom('Premier') }), banId: null },
          { ...aCreer({ nom: Nom('Second') }), banId: null },
        ],
        utilisateurId,
        mediateurId,
        maintenant,
      }),
    ).toEqual(failure({ _tag: 'AdresseNonValidee', nom: 'Premier' }))
  })

  it('refuse un panier vide', async () => {
    expect(
      await ajouterDesLieuxActivite(ports)({
        demandes: [],
        utilisateurId,
        mediateurId,
        maintenant,
      }),
    ).toEqual(failure({ _tag: 'PanierVide' }))
  })

  it.each<{ cas: string; demandes: readonly LieuSoumis[] }>([
    { cas: 'avec un panier', demandes: [connu({ id: LIEU_A })] },
    { cas: 'même avec un panier vide', demandes: [] },
  ])('refuse un compte sans médiateur, $cas', async ({ demandes }) => {
    expect(
      await ajouterDesLieuxActivite(ports)({
        demandes,
        utilisateurId,
        mediateurId: null,
        maintenant,
      }),
    ).toEqual(failure({ _tag: 'MediateurRequis' }))
  })
})
