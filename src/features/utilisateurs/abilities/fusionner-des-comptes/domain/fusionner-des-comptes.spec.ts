import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  RoleUtilisateur,
} from '@/features/utilisateurs/domain'
import {
  CibleFusionId,
  type CompteAFusionner,
  SourceFusionId,
} from './compte-a-fusionner'
import { fusionnerDesComptes } from './fusionner-des-comptes'

const UN = '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'
const DEUX = '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8'

const source: CompteAFusionner<SourceFusionId> = {
  id: SourceFusionId(UN),
  courriel: AdresseCourriel('source@example.com'),
  role: RoleUtilisateur('User'),
  supprime: false,
}

const cible: CompteAFusionner<CibleFusionId> = {
  id: CibleFusionId(DEUX),
  courriel: AdresseCourriel('cible@example.com'),
  role: RoleUtilisateur('User'),
  supprime: false,
}

const fusionnerEntre = (
  sourceLue: CompteAFusionner<SourceFusionId> | null,
  cibleLue: CompteAFusionner<CibleFusionId> | null,
) =>
  fusionnerDesComptes({
    lireLesComptesAFusionner: async () => ({
      source: sourceLue,
      cible: cibleLue,
    }),
    fusionner: async () => undefined,
    retirerLaSourceDesListes: async () => undefined,
  })({ sourceId: UN, cibleId: DEUX })

describe('fusionner des comptes', () => {
  it('fusionne deux comptes distincts', async () => {
    expect(await fusionnerEntre(source, cible)).toEqual({
      success: true,
      data: { source, cible },
    })
  })

  it('accepte une source déjà supprimée', async () => {
    expect(await fusionnerEntre({ ...source, supprime: true }, cible)).toEqual({
      success: true,
      data: { source: { ...source, supprime: true }, cible },
    })
  })

  it.each<{
    cas: string
    sourceLue: CompteAFusionner<SourceFusionId> | null
    cibleLue: CompteAFusionner<CibleFusionId> | null
    erreur: string
  }>([
    {
      cas: 'signale une source introuvable',
      sourceLue: null,
      cibleLue: cible,
      erreur: 'SourceIntrouvable',
    },
    {
      cas: 'signale une cible introuvable',
      sourceLue: source,
      cibleLue: null,
      erreur: 'CibleIntrouvable',
    },
    {
      cas: 'refuse de fusionner un compte avec lui-même',
      sourceLue: source,
      cibleLue: { ...cible, id: CibleFusionId(UN) },
      erreur: 'FusionSurLeMemeCompte',
    },
    {
      cas: 'refuse une cible supprimée',
      sourceLue: source,
      cibleLue: { ...cible, supprime: true },
      erreur: 'CibleSupprimee',
    },
    {
      cas: 'refuse une source administratrice',
      sourceLue: { ...source, role: RoleUtilisateur('Admin') },
      cibleLue: cible,
      erreur: 'RoleProtege',
    },
    {
      cas: 'refuse une cible administratrice',
      sourceLue: source,
      cibleLue: { ...cible, role: RoleUtilisateur('Admin') },
      erreur: 'RoleProtege',
    },
  ])('$cas', async ({ sourceLue, cibleLue, erreur }) => {
    expect(await fusionnerEntre(sourceLue, cibleLue)).toEqual({
      success: false,
      error: { _tag: erreur },
    })
  })
})
