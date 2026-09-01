import {
  AdresseCourriel,
  AuteurId,
  type CompteASupprimer,
  RoleUtilisateur,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import type { AuteurSuppression } from './auteur-suppression'
import { CouloirAutomatique } from './auteur-suppression'
import { autoriserSuppression } from './supprimer-compte'

const compte = (
  surcharge: Partial<CompteASupprimer> = {},
): CompteASupprimer => ({
  id: UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'),
  courriel: AdresseCourriel('jean.dupont@example.com'),
  role: RoleUtilisateur('User'),
  etat: { _tag: 'actif' },
  rattachements: { _tag: 'aucun' },
  liaisons: [],
  ...surcharge,
})

const titulaire: AuteurSuppression = { _tag: 'titulaire' }
const administrateur: AuteurSuppression = {
  _tag: 'administrateur',
  administrateurId: AuteurId('3c4d5e6f-7081-4920-a3b4-c5d6e7f8091a'),
}
const systeme: AuteurSuppression = {
  _tag: 'systeme',
  couloir: CouloirAutomatique('InscritJamaisActif'),
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

  // La garde vaut aussi pour l'auto-suppression : se priver d'un administrateur
  // est une panne d'exploitation, que le clic vienne de lui ou d'un autre.
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

  // Le rejeu est ce qui permettra de rattraper les comptes effacés par l'ancien
  // code, dont les jetons OAuth sont toujours vivants.
  it.each([
    ['un administrateur', administrateur],
    ['le couloir automatique', systeme],
  ])('autorise %s à rejouer un effacement', (_, auteur) => {
    expect(
      autoriserSuppression(
        compte({ etat: { _tag: 'supprime', depuis: new Date() } }),
        auteur,
      ).success,
    ).toBe(true)
  })
})
