import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  NomAffiche,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { apercevoirLaFusionDesComptes } from './apercevoir-la-fusion-des-comptes'
import type { CompteApercu, ContenuDuCompte } from './apercu-de-fusion'

const UN = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')
const DEUX = UtilisateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')

const vide: ContenuDuCompte = {
  beneficiaires: [],
  activites: [],
  structuresEmployeuses: [],
  lieuxActivite: [],
  equipesRejointes: [],
  mediateursCoordonnes: [],
  invitationsRecues: [],
  invitationsEnvoyees: [],
  mutations: [],
  tags: [],
}

const source: CompteApercu = {
  id: UN,
  nom: NomAffiche('Jeanne Source'),
  courriel: AdresseCourriel('source@example.com'),
  etat: { _tag: 'actif' },
  contenu: {
    beneficiaires: ['b1', 'b2'],
    activites: ['a1'],
    structuresEmployeuses: ['s1'],
    lieuxActivite: ['l1', 'l2'],
    equipesRejointes: ['e1'],
    mediateursCoordonnes: ['m1'],
    invitationsRecues: ['ir1'],
    invitationsEnvoyees: ['ie1'],
    mutations: ['mu1'],
    tags: ['t1', 't2'],
  },
}

const cible: CompteApercu = {
  id: DEUX,
  nom: NomAffiche('Jeanne Cible'),
  courriel: AdresseCourriel('cible@example.com'),
  etat: { _tag: 'supprime', depuis: new Date('2026-10-01T00:00:00.000Z') },
  contenu: {
    beneficiaires: ['b2', 'b3'],
    activites: ['a2'],
    structuresEmployeuses: ['s1'],
    lieuxActivite: ['l2'],
    equipesRejointes: ['e1'],
    mediateursCoordonnes: ['m2'],
    invitationsRecues: ['ir1'],
    invitationsEnvoyees: ['ie2'],
    mutations: ['mu1'],
    tags: ['t2'],
  },
}

const apercevoir = (
  sourceLue: CompteApercu | null,
  cibleLue: CompteApercu | null,
) =>
  apercevoirLaFusionDesComptes({
    lireLesComptesAApercevoir: async () => ({
      source: sourceLue,
      cible: cibleLue,
    }),
  })

describe('apercevoir la fusion de deux comptes', () => {
  it('montre les deux comptes et retient, catégorie par catégorie, ce qu’ils ont en commun', async () => {
    expect(
      await apercevoir(source, cible)({ sourceId: UN, cibleId: DEUX }),
    ).toEqual({
      success: true,
      data: {
        source,
        cible,
        communs: {
          ...vide,
          beneficiaires: ['b2'],
          structuresEmployeuses: ['s1'],
          lieuxActivite: ['l2'],
          equipesRejointes: ['e1'],
          invitationsRecues: ['ir1'],
          mutations: ['mu1'],
          tags: ['t2'],
        },
      },
    })
  })

  it.each<{
    cas: string
    sourceId: UtilisateurId | null
    sourceLue: CompteApercu | null
    tag: string
  }>([
    {
      cas: 'une source illisible',
      sourceId: null,
      sourceLue: source,
      tag: 'SourceIntrouvable',
    },
    {
      cas: 'une source introuvable',
      sourceId: UN,
      sourceLue: null,
      tag: 'SourceIntrouvable',
    },
  ])('refuse $cas', async ({ sourceId, sourceLue, tag }) => {
    expect(
      await apercevoir(sourceLue, cible)({ sourceId, cibleId: DEUX }),
    ).toEqual({ success: false, error: { _tag: tag } })
  })

  it.each<{
    cas: string
    cibleId: UtilisateurId | null
    cibleLue: CompteApercu | null
  }>([
    { cas: 'une cible illisible', cibleId: null, cibleLue: cible },
    { cas: 'une cible introuvable', cibleId: DEUX, cibleLue: null },
  ])('refuse $cas', async ({ cibleId, cibleLue }) => {
    expect(
      await apercevoir(source, cibleLue)({ sourceId: UN, cibleId }),
    ).toEqual({ success: false, error: { _tag: 'CibleIntrouvable' } })
  })
})
