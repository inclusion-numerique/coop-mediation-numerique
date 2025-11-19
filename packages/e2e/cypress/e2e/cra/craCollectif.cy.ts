import { appUrl } from '@app/e2e/support/helpers'
import { mediateurAvecActivite } from '@app/fixtures/users/mediateurAvecActivite'
import { mediateurSansActivites } from '@app/fixtures/users/mediateurSansActivites'

describe('ETQ Mediateur, je peux créer un CRA collectif', () => {
  before(() => {
    cy.execute('resetFixtures', {})
  })

  it('Je peux renseigner un CRA collectif à distance', () => {
    cy.signin(mediateurAvecActivite)

    cy.visit(appUrl('/coop/mes-activites/cra/collectif'))

    cy.dsfrShouldBeStarted()

    cy.findByLabelText(/Titre de l’atelier/i).type('Atelier de test')

    cy.findByPlaceholderText(
      'Rechercher parmi vos bénéficiaires enregistrés',
    ).type('Jean')
    cy.get('.fr-menu-options__item').contains('Jean Maximal').click()
    cy.get('.fr-tag').contains('Jean Maximal').should('be.visible')

    cy.findByPlaceholderText(
      'Rechercher parmi vos bénéficiaires enregistrés',
    ).type('Félix')
    cy.get('.fr-menu-options__item').contains('Félix').click()

    cy.get('.fr-tag').contains('Félix').should('be.visible')

    // select value "60" from the "duree.duree" select
    cy.get('select[name="duree.duree"]').select('60')

    cy.findByLabelText(/À distance/i).click({ force: true })

    cy.findByLabelText(/Pas de matériel/i).click({ force: true })

    cy.findAllByLabelText(/Bureautique/i)
      .eq(1)
      .click({ force: true })
    cy.findAllByLabelText(/Parentalité/i)
      .eq(1)
      .click({ force: true })

    cy.findByLabelText(/Avancé/i).click({ force: true })
    cy.intercept('/api/trpc/cra.collectif*').as('mutation')

    cy.get('button[type="submit"]').contains('Enregistrer l’activité').click()
    cy.wait('@mutation')

    cy.appUrlShouldBe('/coop/mes-activites')
  })
})
