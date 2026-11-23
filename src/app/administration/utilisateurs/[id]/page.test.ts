import { appUrl } from '@e2e/support/helpers'
import {
  mediateurSansActivites,
  mediateurSansActivitesUserId,
} from '@/features/utilisateurs/fixtures/users/mediateurSansActivites'

describe('ETQ Visiteur, je ne vois aucune donnée de l’administration', () => {
  before(() => {
    cy.execute('resetFixtures', {})
  })

  it('La fiche d’un utilisateur ne contient pas son e-mail', () => {
    cy.request({
      url: appUrl(
        `/administration/utilisateurs/${mediateurSansActivitesUserId}`,
      ),
      failOnStatusCode: false,
    })
      .its('body')
      .should('not.include', mediateurSansActivites.email)
  })
})
