import {
  AdresseCourriel,
  AuteurId,
  type CompteASupprimer,
  Dispositif,
  RoleUtilisateur,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import type { AuteurSuppression } from './auteur-suppression'
import { RetentionPolicy } from './retention-policy'
import { autoriserSuppression } from './supprimer-compte'

const compte = (
  surcharge: Partial<CompteASupprimer> = {},
): CompteASupprimer => ({
  id: UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'),
  courriel: AdresseCourriel('jean.dupont@example.com'),
  role: RoleUtilisateur('User'),
  etat: { _tag: 'actif' },
  rattachements: { _tag: 'aucun' },
  dispositif: Dispositif('HorsDispositif'),
  ...surcharge,
})

const titulaire: AuteurSuppression = { _tag: 'titulaire' }
const administrateur: AuteurSuppression = {
  _tag: 'administrateur',
  administrateurId: AuteurId('3c4d5e6f-7081-4920-a3b4-c5d6e7f8091a'),
}
const systeme: AuteurSuppression = {
  _tag: 'systeme',
  policy: RetentionPolicy('InscritJamaisActif'),
}

describe('autoriserSuppression', () => {
  it('autorise un compte actif ordinaire', () => {
    expect(autoriserSuppression(compte(), titulaire).success).toBe(true)
  })

  it.each([['Admin'] as const, ['Support'] as const])(
    'refuse un compte %s, quel que soit le demandeur',
    (role) => {
      const result = autoriserSuppression(
        compte({ role: RoleUtilisateur(role) }),
        administrateur,
      )

      expect(result.success).toBe(false)
      expect(result.success === false && result.error._tag).toBe('RoleProtege')
    },
  )

  it("refuse à un administrateur d'effacer son propre compte", () => {
    const result = autoriserSuppression(
      compte({ role: RoleUtilisateur('Admin') }),
      titulaire,
    )

    expect(result.success === false && result.error._tag).toBe('RoleProtege')
  })

  it('refuse au titulaire de supprimer un compte déjà supprimé', () => {
    const result = autoriserSuppression(
      compte({ etat: { _tag: 'supprime', depuis: new Date() } }),
      titulaire,
    )

    expect(result.success === false && result.error._tag).toBe(
      'CompteDejaSupprime',
    )
  })

  it('refuse à un conseiller numérique sous contrat de supprimer son compte', () => {
    const result = autoriserSuppression(
      compte({ dispositif: Dispositif('ConseillerNumerique') }),
      titulaire,
    )

    expect(result.success === false && result.error._tag).toBe(
      'SuppressionReserveeAuDispositif',
    )
  })

  it.each([
    ['un administrateur', administrateur],
    ['la politique de rétention', systeme],
  ])('laisse %s supprimer le compte d’un conseiller numérique', (_, auteur) => {
    expect(
      autoriserSuppression(
        compte({ dispositif: Dispositif('ConseillerNumerique') }),
        auteur,
      ).success,
    ).toBe(true)
  })

  it.each([
    ['un administrateur', administrateur],
    ['la politique de rétention', systeme],
  ])('autorise %s à rejouer un effacement', (_, auteur) => {
    expect(
      autoriserSuppression(
        compte({ etat: { _tag: 'supprime', depuis: new Date() } }),
        auteur,
      ).success,
    ).toBe(true)
  })
})
