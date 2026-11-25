import { appUrl } from '@e2e/support/helpers'
import { administrateur } from '@/features/utilisateurs/fixtures/administrateur'

describe('ETQ administrateur, je parcours la liste des employeuses', () => {
  beforeEach(() => {
    cy.execute('preparerLesPersonas', { ids: [administrateur.id] })
  })

  it('Un en-tête trie la liste, et un second clic inverse le sens', () => {
    cy.signin(administrateur)
    cy.visit(appUrl('/administration/structures-employeuses?page=2'))
    cy.dsfrShouldBeStarted()

    cy.contains('th a', 'Création').click()
    cy.location('search').should('equal', '?tri=creation')

    cy.contains('th a', 'Création').click()
    cy.location('search').should('equal', '?tri=creation&ordre=desc')
  })

  it('Une recherche validée s’écrit dans l’URL et revient à la première page', () => {
    cy.signin(administrateur)
    cy.visit(appUrl('/administration/structures-employeuses?page=2&lignes=20'))
    cy.dsfrShouldBeStarted()

    cy.get('input[name="recherche"]').clear().type('mairie{enter}')

    cy.location('search').should('equal', '?lignes=20&recherche=mairie')
  })
})
