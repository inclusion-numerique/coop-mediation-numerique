import { appUrl } from '@e2e/support/helpers'
import {
  mediateurSansActivites,
  mediateurSansActivitesUserId,
} from '@/features/utilisateurs/fixtures/users/mediateurSansActivites'

const statutDeLExport = (exportDemande: 'statistiques' | 'accompagnements') =>
  cy
    .request({
      url: appUrl(
        `/administration/utilisateurs/${mediateurSansActivitesUserId}/export/${exportDemande}`,
      ),
      failOnStatusCode: false,
    })
    .its('status')

describe('ETQ Visiteur, je ne peux pas exporter les statistiques d’un utilisateur', () => {
  it('L’export des statistiques refuse une requête sans session', () => {
    statutDeLExport('statistiques').should('eq', 401)
  })

  it('L’export des accompagnements refuse une requête sans session', () => {
    statutDeLExport('accompagnements').should('eq', 401)
  })
})

describe('ETQ Médiateur, je ne peux pas exporter les statistiques d’un autre utilisateur depuis l’administration', () => {
  before(() => {
    cy.execute('resetFixtures', {})
  })

  it('L’export des statistiques refuse un médiateur', () => {
    cy.signin(mediateurSansActivites)
    statutDeLExport('statistiques').should('eq', 403)
  })

  it('L’export des accompagnements refuse un médiateur', () => {
    cy.signin(mediateurSansActivites)
    statutDeLExport('accompagnements').should('eq', 403)
  })
})
