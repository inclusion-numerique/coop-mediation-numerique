import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  type RetraitDuContact,
  RoleUtilisateur,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { EchecTechnique, failure, success } from '@/libraries/result'
import type { CompteAFusionner } from './compte-a-fusionner'
import type { EchecDeFusionnerDesComptes } from './errors'
import { fusionnerDesComptes } from './fusionner-des-comptes'

const UN = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')
const DEUX = UtilisateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')

const source: CompteAFusionner = {
  id: UN,
  courriel: AdresseCourriel('source@example.com'),
  role: RoleUtilisateur('User'),
  supprime: false,
}

const cible: CompteAFusionner = {
  id: DEUX,
  courriel: AdresseCourriel('cible@example.com'),
  role: RoleUtilisateur('User'),
  supprime: false,
}

const fusion = (
  sourceLue: CompteAFusionner | null,
  cibleLue: CompteAFusionner | null,
) =>
  fusionnerDesComptes({
    lireLesComptesAFusionner: async () => ({
      source: sourceLue,
      cible: cibleLue,
    }),
    fusionner: async () => undefined,
    retirerLeContactDeLaListe: async () => success({ _tag: 'Retire' }),
    lireLaPresenceDuContact: async () =>
      success({ _tag: 'Present', listes: 0 }),
    supprimerLeContact: async () => success(undefined),
  })

const sourceRetiree: RetraitDuContact = {
  listeDesUtilisateurs: { _tag: 'Retire' },
  contact: { _tag: 'Supprime' },
}

const fusionnerEntre = (
  sourceLue: CompteAFusionner | null,
  cibleLue: CompteAFusionner | null,
) => fusion(sourceLue, cibleLue)({ sourceId: UN, cibleId: DEUX })

describe('fusionner des comptes', () => {
  it('fusionne deux comptes distincts', async () => {
    expect(await fusionnerEntre(source, cible)).toEqual({
      success: true,
      data: { source, cible, retraitDeLaSource: sourceRetiree },
    })
  })

  it('fusionne même quand la source ne peut être retirée des listes, et retient l’échec', async () => {
    expect(
      await fusionnerDesComptes({
        lireLesComptesAFusionner: async () => ({ source, cible }),
        fusionner: async () => undefined,
        retirerLeContactDeLaListe: async () =>
          failure(EchecTechnique('Brevo indisponible')),
        lireLaPresenceDuContact: async () =>
          success({ _tag: 'Present', listes: 0 }),
        supprimerLeContact: async () => success(undefined),
      })({ sourceId: UN, cibleId: DEUX }),
    ).toEqual({
      success: true,
      data: {
        source,
        cible,
        retraitDeLaSource: EchecTechnique('Brevo indisponible'),
      },
    })
  })

  it('accepte une source déjà supprimée', async () => {
    expect(await fusionnerEntre({ ...source, supprime: true }, cible)).toEqual({
      success: true,
      data: {
        source: { ...source, supprime: true },
        cible,
        retraitDeLaSource: sourceRetiree,
      },
    })
  })

  it.each<{
    cas: string
    sourceLue: CompteAFusionner | null
    cibleLue: CompteAFusionner | null
    erreur: EchecDeFusionnerDesComptes
  }>([
    {
      cas: 'signale une source introuvable',
      sourceLue: null,
      cibleLue: cible,
      erreur: { _tag: 'SourceIntrouvable' },
    },
    {
      cas: 'signale une cible introuvable',
      sourceLue: source,
      cibleLue: null,
      erreur: { _tag: 'CibleIntrouvable' },
    },
    {
      cas: 'refuse de fusionner un compte avec lui-même',
      sourceLue: source,
      cibleLue: { ...cible, id: UN },
      erreur: { _tag: 'FusionSurLeMemeCompte' },
    },
    {
      cas: 'refuse une cible supprimée',
      sourceLue: source,
      cibleLue: { ...cible, supprime: true },
      erreur: { _tag: 'CibleSupprimee' },
    },
    {
      cas: 'refuse une source administratrice',
      sourceLue: { ...source, role: RoleUtilisateur('Admin') },
      cibleLue: cible,
      erreur: {
        _tag: 'RoleProtege',
        utilisateurId: UN,
        role: RoleUtilisateur('Admin'),
      },
    },
    {
      cas: 'refuse une cible administratrice',
      sourceLue: source,
      cibleLue: { ...cible, role: RoleUtilisateur('Admin') },
      erreur: {
        _tag: 'RoleProtege',
        utilisateurId: DEUX,
        role: RoleUtilisateur('Admin'),
      },
    },
  ])('$cas', async ({ sourceLue, cibleLue, erreur }) => {
    expect(await fusionnerEntre(sourceLue, cibleLue)).toEqual({
      success: false,
      error: erreur,
    })
  })

  it.each<{
    cas: string
    sourceId: UtilisateurId | null
    cibleId: UtilisateurId | null
    erreur: EchecDeFusionnerDesComptes
  }>([
    {
      cas: 'signale une source qu’aucun identifiant ne désigne',
      sourceId: null,
      cibleId: DEUX,
      erreur: { _tag: 'SourceIntrouvable' },
    },
    {
      cas: 'signale une cible qu’aucun identifiant ne désigne',
      sourceId: UN,
      cibleId: null,
      erreur: { _tag: 'CibleIntrouvable' },
    },
  ])('$cas', async ({ sourceId, cibleId, erreur }) => {
    expect(await fusion(source, cible)({ sourceId, cibleId })).toEqual({
      success: false,
      error: erreur,
    })
  })
})
