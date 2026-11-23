import { appUrl } from '@e2e/support/helpers'
import { mediateurSansActivites } from '@/features/utilisateurs/fixtures/personas/mediateur-sans-activites'

describe('ETQ Visiteur, je ne vois aucune donnée de l’administration', () => {
  before(() => {
    cy.execute('resetFixtures', {})
  })

  it('La liste des utilisateurs ne contient pas l’e-mail recherché', () => {
    cy.request({
      url: appUrl(
        `/administration/utilisateurs?recherche=${mediateurSansActivites.email}`,
      ),
      failOnStatusCode: false,
    })
      .its('body')
      .should('not.include', mediateurSansActivites.email)
  })
})
