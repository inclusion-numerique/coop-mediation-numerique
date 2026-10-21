import {
  AdresseCourriel,
  RoleUtilisateur,
} from '@app/web/features/utilisateurs/domain'
import {
  autoriserFusion,
  CibleFusionId,
  type CompteAFusionner,
  SourceFusionId,
} from './compte-a-fusionner'

const UN = '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'
const DEUX = '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8'

const source = (
  surcharge: Partial<CompteAFusionner<SourceFusionId>> = {},
): CompteAFusionner<SourceFusionId> => ({
  id: SourceFusionId(UN),
  courriel: AdresseCourriel('source@example.com'),
  role: RoleUtilisateur('User'),
  supprime: false,
  ...surcharge,
})

const cible = (
  surcharge: Partial<CompteAFusionner<CibleFusionId>> = {},
): CompteAFusionner<CibleFusionId> => ({
  id: CibleFusionId(DEUX),
  courriel: AdresseCourriel('cible@example.com'),
  role: RoleUtilisateur('User'),
  supprime: false,
  ...surcharge,
})

const erreurDe = (resultat: ReturnType<typeof autoriserFusion>) =>
  resultat.success ? null : resultat.error._tag

describe('autoriser une fusion de comptes', () => {
  it('fusionne deux comptes distincts', () => {
    expect(autoriserFusion(source(), cible()).success).toBe(true)
  })

  it('refuse de fusionner un compte avec lui-même', () => {
    expect(
      erreurDe(autoriserFusion(source(), cible({ id: CibleFusionId(UN) }))),
    ).toBe('FusionSurLeMemeCompte')
  })

  it('refuse une cible supprimée', () => {
    expect(erreurDe(autoriserFusion(source(), cible({ supprime: true })))).toBe(
      'CibleSupprimee',
    )
  })

  it('accepte une source déjà supprimée', () => {
    expect(autoriserFusion(source({ supprime: true }), cible()).success).toBe(
      true,
    )
  })

  it.each(['Admin', 'Support'] as const)('refuse un compte %s', (role) => {
    expect(
      erreurDe(
        autoriserFusion(source({ role: RoleUtilisateur(role) }), cible()),
      ),
    ).toBe('RoleProtege')
  })
})
