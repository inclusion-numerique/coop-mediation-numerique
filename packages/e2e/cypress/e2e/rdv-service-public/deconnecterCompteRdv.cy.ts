import { appUrl } from '@app/e2e/support/helpers'
import { mediateurSansActivites } from '@app/fixtures/users/mediateurSansActivites'

/**
 * Couvre le câblage de la déconnexion : la server action, la modale et le
 * rafraîchissement de la page. L'ability elle-même est vérifiée par ses scénarios
 * Cucumber ; ce qu'on vérifie ici est ce qu'aucun d'eux ne voit — que le bouton
 * atteint bien le domaine, et que la page en rend compte.
 *
 * La liaison est posée en base plutôt que jouée : le parcours OAuth dépend de
 * RDV Service Public, la gestion du compte une fois lié n'en dépend pas.
 */
/**
 * Identifiant passé à `createModal` dans `GererRdvServicePublicModal`, et rendu
 * tel quel sur le `<dialog>`. Recopié plutôt qu'importé : importer le composant
 * embarquerait React et la moitié de l'application dans le spec.
 */
const MODALE_GESTION = 'gerer-rdv-service-public'

describe('ETQ médiateur, je peux déconnecter mon compte RDV Service Public', () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
    cy.execute('connectRdvAccountFor', { email: mediateurSansActivites.email })
  })

  it('Je déconnecte mon compte depuis la modale de gestion', () => {
    cy.signin(mediateurSansActivites)
    cy.visit(appUrl('/coop/mes-outils/rdv-service-public'))

    cy.contains('Compte connecté').should('be.visible')

    // Le JS du DSFR lie les modales après l'hydratation : un clic parti avant
    // n'ouvre rien, le bouton ne portant qu'un `aria-controls`.
    cy.dsfrModalsShouldBeBound()
    cy.findByRole('button', { name: 'Gérer la connexion' }).click()

    // L'ouverture est vérifiée explicitement : une modale fermée est marquée
    // `aria-hidden`, et son contenu devient introuvable par rôle — l'échec se
    // présenterait alors comme un bouton manquant.
    cy.get(`#${MODALE_GESTION}`).should('be.visible')

    cy.findByRole('button', { name: 'Déconnecter l’intégration' }).click()
    cy.contains(
      'En déconnectant votre compte RDV Service Public, vous n’aurez plus accès',
    ).should('be.visible')

    cy.findByRole('button', { name: 'Déconnecter' }).click()

    cy.getToast('Votre compte RDV Service Public a bien été déconnecté.')

    cy.execute('getRdvAccountFor', {
      email: mediateurSansActivites.email,
    }).then((compte) => {
      expect(compte, 'le compte reste en base, en soft delete').to.not.be.null
      expect(compte?.deleted, 'la date de déconnexion est posée').to.not.be.null
      expect(compte?.accessToken, 'le jeton d’accès est purgé').to.be.null
      expect(compte?.refreshToken, 'le jeton de rafraîchissement est purgé').to
        .be.null
      expect(compte?.scope, 'la portée est purgée').to.be.null
      expect(
        compte?.syncFrom,
        'la fenêtre de synchronisation survit, pour une reconnexion ultérieure',
      ).to.not.be.null
    })

    cy.contains('Compte déconnecté').should('be.visible')
  })
})
