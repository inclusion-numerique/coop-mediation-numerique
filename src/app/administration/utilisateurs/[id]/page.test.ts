import { appUrl } from '@e2e/support/helpers'
import {
  idDuMediateurSansActivites,
  mediateurSansActivites,
} from '@/features/utilisateurs/fixtures/mediateurs/mediateur-sans-activites'

describe('ETQ Visiteur, je ne vois aucune donnée de l’administration', () => {
  before(() => {
    cy.execute('preparerLesPersonas', { ids: [mediateurSansActivites.id] })
  })

  it('La fiche d’un utilisateur ne contient pas son e-mail', () => {
    cy.request({
      url: appUrl(`/administration/utilisateurs/${idDuMediateurSansActivites}`),
      failOnStatusCode: false,
    })
      .its('body')
      .should('not.include', mediateurSansActivites.email)
  })
})
