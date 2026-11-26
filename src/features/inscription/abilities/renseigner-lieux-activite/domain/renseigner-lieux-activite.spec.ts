import { describe, expect, it } from 'vitest'
import {
  Franchissement,
  type InscriptionEnCours,
  type InscriptionEtat,
  LieuId,
  Role,
  UtilisateurId,
} from '@/features/inscription/domain'
import { failure, success } from '@/libraries/result'
import type { LieuSoumis } from './lieux-desires'
import type { RenseignerLieuxActivitePorts } from './ports'
import type { LieuActiviteExistant, LieuActiviteInput } from './reconcilier'
import { renseignerLieuxActivite } from './renseigner-lieux-activite'

const userId = UtilisateurId('11111111-1111-1111-1111-111111111111')

const maintenant = new Date('2026-07-16T10:00:00.000Z')

const acceptationCgu = new Date('2026-07-01T00:00:00.000Z')

const enCours: InscriptionEtat = {
  _tag: 'EnCours',
  userId,
  role: Role('Mediateur'),
  conseillerNumerique: false,
  acceptationCgu,
  progression: {
    structureEmployeuse: Franchissement(acceptationCgu),
    lieuxActivite: Franchissement(null),
  },
}

const etatFranchi: InscriptionEnCours = {
  _tag: 'EnCours',
  userId,
  role: Role('Mediateur'),
  conseillerNumerique: false,
  acceptationCgu,
  progression: {
    structureEmployeuse: Franchissement(acceptationCgu),
    lieuxActivite: Franchissement(maintenant),
  },
}

const validee: InscriptionEtat = {
  _tag: 'Validee',
  userId,
  role: Role('Mediateur'),
  conseillerNumerique: false,
  acceptationCgu,
  progression: {
    structureEmployeuse: Franchissement(acceptationCgu),
    lieuxActivite: Franchissement(acceptationCgu),
  },
  inscriptionValidee: acceptationCgu,
}

const adresse = {
  adresse: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
}

const adresseGeocodee = {
  ...adresse,
  codeInsee: '51454',
  banId: '51454_0018_00012',
  latitude: 49.25,
  longitude: 4.03,
}

const connu = (id: string, nom: string): LieuSoumis => ({ id, nom, ...adresse })

const connuDesire = (id: string, nom: string): LieuActiviteInput => ({
  id,
  nom,
  ...adresse,
})

const carto = (structureCartographieNationaleId: string): LieuSoumis => ({
  id: null,
  structureCartographieNationaleId,
  nom: 'Lieu carto',
  ...adresseGeocodee,
})

const cartoDesire = (
  structureCartographieNationaleId: string,
): LieuActiviteInput => ({
  structureCartographieNationaleId,
  nom: 'Lieu carto',
  ...adresseGeocodee,
})

const nouveau = (nom: string): LieuSoumis => ({ nom, ...adresseGeocodee })

const nouveauDesire = (nom: string): LieuActiviteInput => ({
  nom,
  ...adresseGeocodee,
})

const existant = (
  id: string,
  lieuId: string,
  structureCartographieNationaleId: string | null,
): LieuActiviteExistant => ({
  id,
  lieuInclusion: { id: lieuId, structureCartographieNationaleId },
})

const destinations = ['destination-1']

const lieuIntrouvable = LieuId('7c9e6679-7425-40de-944b-e07fc1f90ae7')

const ports: RenseignerLieuxActivitePorts<string, string> = {
  lireLEtat: async () => enCours,
  lireLieuxActiviteExistants: async () => [],
  trouverStructuresCarto: async () => new Map<string, string>(),
  planifierLesRattachements: async () => success(destinations),
  enregistrerReconciliation: async () => ({ _tag: 'Enregistree' }),
}

const avecExistants = (
  existants: readonly LieuActiviteExistant[],
): RenseignerLieuxActivitePorts<string, string> => ({
  ...ports,
  lireLieuxActiviteExistants: async () => existants,
})

describe('renseigner les lieux d’activité', () => {
  it.each<{
    cas: string
    existants: readonly LieuActiviteExistant[]
    lieux: readonly LieuSoumis[]
    aCloturer: readonly string[]
    aCreer: readonly LieuActiviteInput[]
  }>([
    {
      cas: 'ne change rien quand les lieux soumis sont déjà ceux de l’utilisateur',
      existants: [existant('act-1', 'lieu-1', null)],
      lieux: [connu('lieu-1', 'Lieu 1')],
      aCloturer: [],
      aCreer: [],
    },
    {
      cas: 'rattache un lieu connu pas encore rattaché, sans adresse géocodée',
      existants: [],
      lieux: [connu('lieu-1', 'Lieu 1')],
      aCloturer: [],
      aCreer: [connuDesire('lieu-1', 'Lieu 1')],
    },
    {
      cas: 'crée un lieu identifié par la cartographie nationale',
      existants: [],
      lieux: [carto('carto-1')],
      aCloturer: [],
      aCreer: [cartoDesire('carto-1')],
    },
    {
      cas: 'crée un nouveau lieu dont l’adresse a été géocodée',
      existants: [],
      lieux: [nouveau('Nouveau lieu')],
      aCloturer: [],
      aCreer: [nouveauDesire('Nouveau lieu')],
    },
    {
      cas: 'clôt l’activité dont le lieu, désigné par son id interne, n’est plus soumis',
      existants: [existant('act-1', 'lieu-1', null)],
      lieux: [connu('lieu-2', 'Lieu 2')],
      aCloturer: ['act-1'],
      aCreer: [connuDesire('lieu-2', 'Lieu 2')],
    },
    {
      cas: 'clôt l’activité dont le lieu, désigné par la cartographie, n’est plus soumis',
      existants: [existant('act-1', 'lieu-1', 'carto-1')],
      lieux: [carto('carto-2')],
      aCloturer: ['act-1'],
      aCreer: [cartoDesire('carto-2')],
    },
    {
      cas: 'ne clôt pas un lieu soumis par son seul id interne alors qu’il porte un id de cartographie',
      existants: [existant('act-1', 'lieu-1', 'carto-1')],
      lieux: [connu('lieu-1', 'Lieu 1')],
      aCloturer: [],
      aCreer: [],
    },
    {
      cas: 'ne recrée pas l’activité d’un lieu déjà rattaché par son id de cartographie',
      existants: [existant('act-1', 'lieu-1', 'carto-1')],
      lieux: [carto('carto-1')],
      aCloturer: [],
      aCreer: [],
    },
    {
      cas: 'ne recrée pas l’activité d’un lieu soumis avec son id interne et son id de cartographie',
      existants: [existant('act-1', 'lieu-1', 'carto-1')],
      lieux: [
        {
          ...connu('lieu-1', 'Lieu 1'),
          structureCartographieNationaleId: 'carto-1',
        },
      ],
      aCloturer: [],
      aCreer: [],
    },
    {
      cas: 'ne crée qu’une activité pour un même lieu connu soumis deux fois',
      existants: [],
      lieux: [connu('lieu-1', 'Lieu 1'), connu('lieu-1', 'Lieu 1')],
      aCloturer: [],
      aCreer: [connuDesire('lieu-1', 'Lieu 1')],
    },
    {
      cas: 'ne crée qu’une activité pour un même lieu de cartographie soumis deux fois',
      existants: [],
      lieux: [carto('carto-1'), carto('carto-1')],
      aCloturer: [],
      aCreer: [cartoDesire('carto-1')],
    },
    {
      cas: 'ne crée qu’une activité pour un même nouveau lieu nommé deux fois',
      existants: [],
      lieux: [nouveau('Lieu neuf'), nouveau('Lieu neuf')],
      aCloturer: [],
      aCreer: [nouveauDesire('Lieu neuf')],
    },
    {
      cas: 'distingue deux lieux soumis que rien ne confond',
      existants: [],
      lieux: [connu('lieu-1', 'Lieu 1'), nouveau('Lieu 2')],
      aCloturer: [],
      aCreer: [connuDesire('lieu-1', 'Lieu 1'), nouveauDesire('Lieu 2')],
    },
  ])('$cas', async ({ existants, lieux, aCloturer, aCreer }) => {
    expect(
      await renseignerLieuxActivite(avecExistants(existants))({
        command: { userId, lieuxActivite: lieux },
        maintenant,
      }),
    ).toEqual(success({ etatFranchi, aCloturer, aCreer, destinations }))
  })

  it('ne prête à un lieu connu aucun identifiant qui n’a pas été soumis', async () => {
    expect(
      await renseignerLieuxActivite(ports)({
        command: { userId, lieuxActivite: [connu('lieu-1', 'Lieu 1')] },
        maintenant,
      }),
    ).toStrictEqual(
      success({
        etatFranchi,
        aCloturer: [],
        aCreer: [connuDesire('lieu-1', 'Lieu 1')],
        destinations,
      }),
    )
  })

  it('reprend tels quels le SIRET, l’id de cartographie et le code INSEE soumis pour un lieu connu', async () => {
    expect(
      await renseignerLieuxActivite(ports)({
        command: {
          userId,
          lieuxActivite: [
            {
              ...connu('lieu-1', 'Lieu 1'),
              siret: null,
              structureCartographieNationaleId: 'carto-42',
              codeInsee: null,
              banId: null,
              latitude: null,
              longitude: null,
            },
          ],
        },
        maintenant,
      }),
    ).toEqual(
      success({
        etatFranchi,
        aCloturer: [],
        aCreer: [
          {
            ...connuDesire('lieu-1', 'Lieu 1'),
            siret: null,
            structureCartographieNationaleId: 'carto-42',
            codeInsee: null,
          },
        ],
        destinations,
      }),
    )
  })

  it.each<{ cas: string; etat: InscriptionEtat | null; erreur: string }>([
    {
      cas: 'refuse une inscription introuvable',
      etat: null,
      erreur: 'InscriptionIntrouvable',
    },
    {
      cas: 'refuse une inscription dont le profil n’est pas choisi',
      etat: { _tag: 'NonDemarree', userId },
      erreur: 'ProfilNonChoisi',
    },
    {
      cas: 'refuse une inscription déjà validée',
      etat: validee,
      erreur: 'InscriptionDejaValidee',
    },
  ])('$cas', async ({ etat, erreur }) => {
    expect(
      await renseignerLieuxActivite({ ...ports, lireLEtat: async () => etat })({
        command: { userId, lieuxActivite: [connu('lieu-1', 'Lieu 1')] },
        maintenant,
      }),
    ).toEqual(failure({ _tag: erreur, userId }))
  })

  it.each<{ cas: string; lieux: readonly LieuSoumis[]; nom: string }>([
    {
      cas: 'refuse de créer un lieu sans code INSEE',
      lieux: [
        connu('lieu-1', 'Lieu 1'),
        { ...nouveau('Neuf'), codeInsee: null },
      ],
      nom: 'Neuf',
    },
    {
      cas: 'refuse de créer un lieu sans identifiant BAN',
      lieux: [connu('lieu-1', 'Lieu 1'), { ...nouveau('Neuf'), banId: null }],
      nom: 'Neuf',
    },
    {
      cas: 'refuse de créer un lieu sans latitude',
      lieux: [
        connu('lieu-1', 'Lieu 1'),
        { ...nouveau('Neuf'), latitude: null },
      ],
      nom: 'Neuf',
    },
    {
      cas: 'refuse de créer un lieu sans longitude',
      lieux: [
        connu('lieu-1', 'Lieu 1'),
        { ...nouveau('Neuf'), longitude: undefined },
      ],
      nom: 'Neuf',
    },
    {
      cas: 'signale le premier lieu refusé',
      lieux: [
        { ...nouveau('Premier'), banId: null },
        { ...nouveau('Second'), banId: null },
      ],
      nom: 'Premier',
    },
  ])('$cas', async ({ lieux, nom }) => {
    expect(
      await renseignerLieuxActivite(ports)({
        command: { userId, lieuxActivite: lieux },
        maintenant,
      }),
    ).toEqual(failure({ _tag: 'AdresseNonValidee', nom }))
  })

  it('refuse les lieux dont l’un n’existe plus au moment de les planifier', async () => {
    expect(
      await renseignerLieuxActivite({
        ...ports,
        planifierLesRattachements: async () =>
          failure({ _tag: 'LieuIntrouvable', lieuId: lieuIntrouvable }),
      })({
        command: { userId, lieuxActivite: [connu('lieu-1', 'Lieu 1')] },
        maintenant,
      }),
    ).toEqual(failure({ _tag: 'LieuIntrouvable', lieuId: lieuIntrouvable }))
  })

  it('refuse les lieux dont l’un a disparu avant l’enregistrement', async () => {
    expect(
      await renseignerLieuxActivite({
        ...ports,
        enregistrerReconciliation: async () => ({
          _tag: 'LieuDisparu',
          lieuId: lieuIntrouvable,
        }),
      })({
        command: { userId, lieuxActivite: [connu('lieu-1', 'Lieu 1')] },
        maintenant,
      }),
    ).toEqual(failure({ _tag: 'LieuIntrouvable', lieuId: lieuIntrouvable }))
  })
})
