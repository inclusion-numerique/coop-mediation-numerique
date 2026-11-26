import { describe, expect, it } from 'vitest'
import {
  Franchissement,
  type InscriptionEtat,
  Role,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { LieuSoumis } from './lieux-desires'
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

const lieuConnu: LieuSoumis = {
  id: 'lieu-1',
  nom: 'Médiathèque',
  adresse: '4 rue de la Rue',
  commune: 'Lyon',
  codePostal: '69001',
  structureCartographieNationaleId: 'carto-1',
}

const nouveau: LieuSoumis = {
  id: null,
  structureCartographieNationaleId: null,
  nom: 'Maison France Services',
  siret: '55217862900135',
  adresse: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  banId: '51454_0018_00012',
  latitude: 49.25,
  longitude: 4.03,
}

const renseigner = (etat: InscriptionEtat | null) =>
  renseignerLieuxActivite({
    lireLEtat: async () => etat,
    lireLieuxActiviteExistants: async () => [],
    trouverStructuresCarto: async () => new Map(),
    enregistrerReconciliation: async () => undefined,
  })

describe('renseignerLieuxActivite', () => {
  it('enregistre les lieux d’activité d’une inscription en cours', async () => {
    expect(
      await renseigner(enCours)({
        command: { userId, lieuxActivite: [lieuConnu] },
        maintenant,
      }),
    ).toEqual({ success: true, data: undefined })
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
      await renseigner(etat)({
        command: { userId, lieuxActivite: [lieuConnu] },
        maintenant,
      }),
    ).toEqual({ success: false, error: { _tag: erreur, userId } })
  })

  it.each<{ cas: string; lieux: readonly LieuSoumis[]; nom: string }>([
    {
      cas: 'refuse de créer un lieu sans code INSEE',
      lieux: [lieuConnu, { ...nouveau, codeInsee: null }],
      nom: 'Maison France Services',
    },
    {
      cas: 'refuse de créer un lieu sans identifiant BAN',
      lieux: [lieuConnu, { ...nouveau, banId: null }],
      nom: 'Maison France Services',
    },
    {
      cas: 'refuse de créer un lieu sans latitude',
      lieux: [lieuConnu, { ...nouveau, latitude: null }],
      nom: 'Maison France Services',
    },
    {
      cas: 'refuse de créer un lieu sans longitude',
      lieux: [lieuConnu, { ...nouveau, longitude: undefined }],
      nom: 'Maison France Services',
    },
    {
      cas: 'signale le premier lieu refusé',
      lieux: [
        { ...nouveau, nom: 'Premier', banId: null },
        { ...nouveau, nom: 'Second', banId: null },
      ],
      nom: 'Premier',
    },
  ])('$cas', async ({ lieux, nom }) => {
    expect(
      await renseigner(enCours)({
        command: { userId, lieuxActivite: lieux },
        maintenant,
      }),
    ).toEqual({ success: false, error: { _tag: 'AdresseNonValidee', nom } })
  })
})
