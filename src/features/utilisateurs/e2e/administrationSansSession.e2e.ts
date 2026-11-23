import { appUrl } from '@e2e/support/helpers'
import {
  mediateurSansActivites,
  mediateurSansActivitesUserId,
} from '@/features/utilisateurs/fixtures/users/mediateurSansActivites'

const pageSansSession = (chemin: string) =>
  cy.request({ url: appUrl(chemin), failOnStatusCode: false }).its('body')

describe('ETQ Visiteur, je ne vois aucune donnée de l’administration', () => {
  before(() => {
    cy.execute('resetFixtures', {})
  })

  it('La liste des utilisateurs ne contient pas l’e-mail recherché', () => {
    pageSansSession(
      `/administration/utilisateurs?recherche=${mediateurSansActivites.email}`,
    ).should('not.include', mediateurSansActivites.email)
  })

  it('La fiche d’un utilisateur ne contient pas son e-mail', () => {
    pageSansSession(
      `/administration/utilisateurs/${mediateurSansActivitesUserId}`,
    ).should('not.include', mediateurSansActivites.email)
  })
})
