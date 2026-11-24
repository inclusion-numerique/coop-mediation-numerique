import { appUrl } from '@e2e/support/helpers'
import {
  idDuMediateurSansActivites,
  mediateurSansActivites,
} from '@/features/utilisateurs/fixtures/mediateurs/mediateur-sans-activites'

const statutDeLExport = () =>
  cy
    .request({
      url: appUrl(
        `/administration/utilisateurs/${idDuMediateurSansActivites}/export/statistiques`,
      ),
      failOnStatusCode: false,
    })
    .its('status')

describe('ETQ Visiteur, je ne peux pas exporter les statistiques d’un utilisateur', () => {
  it('L’export refuse une requête sans session', () => {
    statutDeLExport().should('eq', 401)
  })
})

describe('ETQ Médiateur, je ne peux pas exporter les statistiques d’un autre utilisateur depuis l’administration', () => {
  before(() => {
    cy.execute('preparerLesPersonas', { ids: [mediateurSansActivites.id] })
  })

  it('L’export refuse un médiateur', () => {
    cy.signin(mediateurSansActivites)
    statutDeLExport().should('eq', 403)
  })
})
