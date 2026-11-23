import { appUrl } from '@e2e/support/helpers'
import {
  mediateurSansActivites,
  mediateurSansActivitesUserId,
} from '@/features/utilisateurs/fixtures/personas/mediateur-sans-activites'

const statutDeLExport = () =>
  cy
    .request({
      url: appUrl(
        `/administration/utilisateurs/${mediateurSansActivitesUserId}/export/accompagnements`,
      ),
      failOnStatusCode: false,
    })
    .its('status')

describe('ETQ Visiteur, je ne peux pas exporter les accompagnements d’un utilisateur', () => {
  it('L’export refuse une requête sans session', () => {
    statutDeLExport().should('eq', 401)
  })
})

describe('ETQ Médiateur, je ne peux pas exporter les accompagnements d’un autre utilisateur depuis l’administration', () => {
  before(() => {
    cy.execute('resetFixtures', {})
  })

  it('L’export refuse un médiateur', () => {
    cy.signin(mediateurSansActivites)
    statutDeLExport().should('eq', 403)
  })
})
