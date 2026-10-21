import identiteSimulee from '../../proconnect-simule/identite.json'
import { appUrl } from '../../support/helpers'

describe('ETQ Utilisateur, je peux me connecter à mon compte / me déconnecter avec ProConnect', () => {
  before(() => {
    cy.execute('deleteUser', { email: identiteSimulee.email })
  })

  it('Préliminaire - Les pages de connexions sont accessibles', () => {
    cy.visit('/')
    cy.get('.fr-header__tools').contains('Se connecter').click()
    cy.url().should('equal', appUrl('/connexion'))
  })

  it('Acceptation 1 - Connexion avec ProConnect', () => {
    cy.visit('/connexion')

    cy.get('button[title="S’identifier avec ProConnect"]').click()

    cy.url().should('equal', appUrl('/inscription/choisir-role'))

    cy.get('.fr-header__tools').should('not.contain', 'Se connecter')

    cy.log('Check that the user can logout')

    cy.dsfrShouldBeStarted()
    cy.dsfrCollapsesShouldBeBound()
    cy.get('.fr-header__tools button[aria-controls="header-user-menu"]')
      .contains(identiteSimulee.given_name)
      .contains(identiteSimulee.usual_name)
      .click()

    cy.get('#header-user-menu').should('be.visible')

    cy.get('#header-user-menu').contains('Se déconnecter').click()

    cy.url().should('equal', appUrl('/deconnexion'))
    cy.contains('Êtes-vous sûr de vouloir vous déconnecter ?')
    cy.get('main').contains('Se déconnecter').click()

    cy.url().should('equal', appUrl('/'))

    cy.get('.fr-header__tools').contains('Se connecter')
  })
})
