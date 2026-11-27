import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
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
import { IdentifiantCartographie } from './identifiant-cartographie'
import type {
  LieuConnu,
  LieuDesire,
  LieuNouveau,
  LieuNouveauSoumis,
  LieuSoumis,
} from './lieu-soumis'
import type { RenseignerLieuxActivitePorts } from './ports'
import { RattachementId } from './rattachement-id'
import type { LieuActiviteExistant } from './reconcilier'
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

type AdresseDeTest = { readonly adresse: string }

const adresseGeocodee: AdresseDeTest = {
  adresse: '12 rue de la Paix, 51100 Reims',
}

const lieu1 = LieuId('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d')

const lieu2 = LieuId('1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed')

const activite1 = RattachementId('6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b')

const carto1 = IdentifiantCartographie('carto-1')

const carto2 = IdentifiantCartographie('carto-2')

const connu = (id: LieuId, nom: string): LieuConnu => ({
  _tag: 'LieuExistant',
  id,
  nom: Nom(nom),
  siret: null,
  structureCartographieNationaleId: null,
})

const carto = (
  structureCartographieNationaleId: IdentifiantCartographie,
): LieuNouveau<AdresseDeTest> => ({
  _tag: 'LieuACreer',
  nom: Nom('Lieu carto'),
  siret: null,
  structureCartographieNationaleId,
  ...adresseGeocodee,
})

const cartoSoumis = (
  structureCartographieNationaleId: IdentifiantCartographie,
): LieuNouveauSoumis<AdresseDeTest> => ({
  _tag: 'LieuACreer',
  nom: Nom('Lieu carto'),
  siret: null,
  structureCartographieNationaleId,
  adresseValidee: adresseGeocodee,
})

const nouveau = (nom: string): LieuNouveau<AdresseDeTest> => ({
  _tag: 'LieuACreer',
  nom: Nom(nom),
  siret: null,
  structureCartographieNationaleId: null,
  ...adresseGeocodee,
})

const nouveauSoumis = (nom: string): LieuNouveauSoumis<AdresseDeTest> => ({
  _tag: 'LieuACreer',
  nom: Nom(nom),
  siret: null,
  structureCartographieNationaleId: null,
  adresseValidee: adresseGeocodee,
})

const sansAdresse = (nom: string): LieuNouveauSoumis<AdresseDeTest> => ({
  ...nouveauSoumis(nom),
  adresseValidee: null,
})

const existant = (
  lieuId: LieuId,
  structureCartographieNationaleId: IdentifiantCartographie | null,
): LieuActiviteExistant => ({
  id: activite1,
  lieuInclusion: { id: lieuId, structureCartographieNationaleId },
})

const destinations = ['destination-1']

const lieuIntrouvable = LieuId('7c9e6679-7425-40de-944b-e07fc1f90ae7')

const ports: RenseignerLieuxActivitePorts<AdresseDeTest, string, string> = {
  lireLEtat: async () => enCours,
  lireLieuxActiviteExistants: async () => [],
  trouverStructuresCarto: async () => 'structures carto',
  planifierLesRattachements: async () => success(destinations),
  enregistrerReconciliation: async () => ({ _tag: 'Enregistree' }),
}

const avecExistants = (
  existants: readonly LieuActiviteExistant[],
): RenseignerLieuxActivitePorts<AdresseDeTest, string, string> => ({
  ...ports,
  lireLieuxActiviteExistants: async () => existants,
})

describe('renseigner les lieux d’activité', () => {
  it.each<{
    cas: string
    existants: readonly LieuActiviteExistant[]
    lieux: readonly LieuSoumis<AdresseDeTest>[]
    aCloturer: readonly RattachementId[]
    aCreer: readonly LieuDesire<AdresseDeTest>[]
  }>([
    {
      cas: 'ne change rien quand les lieux soumis sont déjà ceux de l’utilisateur',
      existants: [existant(lieu1, null)],
      lieux: [connu(lieu1, 'Lieu 1')],
      aCloturer: [],
      aCreer: [],
    },
    {
      cas: 'rattache un lieu connu pas encore rattaché',
      existants: [],
      lieux: [connu(lieu1, 'Lieu 1')],
      aCloturer: [],
      aCreer: [connu(lieu1, 'Lieu 1')],
    },
    {
      cas: 'crée un lieu identifié par la cartographie nationale',
      existants: [],
      lieux: [cartoSoumis(carto1)],
      aCloturer: [],
      aCreer: [carto(carto1)],
    },
    {
      cas: 'crée un nouveau lieu dont l’adresse a été validée',
      existants: [],
      lieux: [nouveauSoumis('Nouveau lieu')],
      aCloturer: [],
      aCreer: [nouveau('Nouveau lieu')],
    },
    {
      cas: 'clôt l’activité dont le lieu, désigné par son id interne, n’est plus soumis',
      existants: [existant(lieu1, null)],
      lieux: [connu(lieu2, 'Lieu 2')],
      aCloturer: [activite1],
      aCreer: [connu(lieu2, 'Lieu 2')],
    },
    {
      cas: 'clôt l’activité dont le lieu, désigné par la cartographie, n’est plus soumis',
      existants: [existant(lieu1, carto1)],
      lieux: [cartoSoumis(carto2)],
      aCloturer: [activite1],
      aCreer: [carto(carto2)],
    },
    {
      cas: 'ne clôt pas un lieu soumis par son seul id interne alors qu’il porte un id de cartographie',
      existants: [existant(lieu1, carto1)],
      lieux: [connu(lieu1, 'Lieu 1')],
      aCloturer: [],
      aCreer: [],
    },
    {
      cas: 'ne recrée pas l’activité d’un lieu déjà rattaché par son id de cartographie',
      existants: [existant(lieu1, carto1)],
      lieux: [cartoSoumis(carto1)],
      aCloturer: [],
      aCreer: [],
    },
    {
      cas: 'ne recrée pas l’activité d’un lieu soumis avec son id interne et son id de cartographie',
      existants: [existant(lieu1, carto1)],
      lieux: [
        { ...connu(lieu1, 'Lieu 1'), structureCartographieNationaleId: carto1 },
      ],
      aCloturer: [],
      aCreer: [],
    },
    {
      cas: 'ne crée qu’une activité pour un même lieu connu soumis deux fois',
      existants: [],
      lieux: [connu(lieu1, 'Lieu 1'), connu(lieu1, 'Lieu 1')],
      aCloturer: [],
      aCreer: [connu(lieu1, 'Lieu 1')],
    },
    {
      cas: 'ne crée qu’une activité pour un même lieu de cartographie soumis deux fois',
      existants: [],
      lieux: [cartoSoumis(carto1), cartoSoumis(carto1)],
      aCloturer: [],
      aCreer: [carto(carto1)],
    },
    {
      cas: 'ne crée qu’une activité pour un même nouveau lieu nommé deux fois',
      existants: [],
      lieux: [nouveauSoumis('Lieu neuf'), nouveauSoumis('Lieu neuf')],
      aCloturer: [],
      aCreer: [nouveau('Lieu neuf')],
    },
    {
      cas: 'distingue deux lieux soumis que rien ne confond',
      existants: [],
      lieux: [connu(lieu1, 'Lieu 1'), nouveauSoumis('Lieu 2')],
      aCloturer: [],
      aCreer: [connu(lieu1, 'Lieu 1'), nouveau('Lieu 2')],
    },
  ])('$cas', async ({ existants, lieux, aCloturer, aCreer }) => {
    expect(
      await renseignerLieuxActivite(avecExistants(existants))({
        command: { userId, lieuxActivite: lieux },
        maintenant,
      }),
    ).toEqual(success({ etatFranchi, aCloturer, aCreer, destinations }))
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
        command: { userId, lieuxActivite: [connu(lieu1, 'Lieu 1')] },
        maintenant,
      }),
    ).toEqual(failure({ _tag: erreur, userId }))
  })

  it.each<{
    cas: string
    lieux: readonly LieuSoumis<AdresseDeTest>[]
    nom: string
  }>([
    {
      cas: 'refuse de créer un lieu dont l’adresse n’a pas été validée',
      lieux: [connu(lieu1, 'Lieu 1'), sansAdresse('Neuf')],
      nom: 'Neuf',
    },
    {
      cas: 'signale le premier lieu refusé',
      lieux: [sansAdresse('Premier'), sansAdresse('Second')],
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
        command: { userId, lieuxActivite: [connu(lieu1, 'Lieu 1')] },
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
        command: { userId, lieuxActivite: [connu(lieu1, 'Lieu 1')] },
        maintenant,
      }),
    ).toEqual(failure({ _tag: 'LieuIntrouvable', lieuId: lieuIntrouvable }))
  })
})
