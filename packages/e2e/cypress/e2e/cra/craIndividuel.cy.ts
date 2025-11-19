import { appUrl } from '@app/e2e/support/helpers'
import { mediateurAvecActivite } from '@app/fixtures/users/mediateurAvecActivite'
import { mediateurSansActivites } from '@app/fixtures/users/mediateurSansActivites'

describe('ETQ Mediateur, je peux créer un CRA individuel', () => {
  before(() => {
    cy.execute('resetFixtures', {})
  })

  it('Je peux renseigner un CRA individuel à distance', () => {
    cy.signin(mediateurAvecActivite)

    cy.visit(appUrl('/coop/mes-activites/cra/individuel'))

    cy.dsfrShouldBeStarted()

    cy.findByRole('button', { name: 'Lier à un bénéficiaire' }).click()
    cy.findByPlaceholderText(
      'Rechercher parmi vos bénéficiaires enregistrés',
    ).type('Jean')
    cy.get('.fr-menu-options__item').contains('Jean Maximal').click()
    cy.findByText('BÉNÉFICIAIRE DE L’ACCOMPAGNEMENT').should('be.visible')

    cy.get('p').contains('Jean Maximal').should('be.visible')

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

    cy.findByLabelText(/Autonome avec guidage/i).click({ force: true })
    cy.intercept('/api/trpc/cra.individuel*').as('mutation')

    cy.get('button[type="submit"]').contains('Enregistrer l’activité').click()
    cy.wait('@mutation')

    cy.appUrlShouldBe('/coop/mes-activites')
  })
})
