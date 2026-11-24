import { appUrl } from '@e2e/support/helpers'
import { administrateur } from '@/features/utilisateurs/fixtures/administrateur'

describe('ETQ administrateur, je filtre la liste des utilisateurs', () => {
  beforeEach(() => {
    cy.execute('preparerLesPersonas', { ids: [administrateur.id] })
  })

  it('Un rôle validé filtre la liste, et son étiquette le retire', () => {
    cy.signin(administrateur)
    cy.visit(appUrl('/administration/utilisateurs'))
    cy.dsfrShouldBeStarted()

    cy.contains('button', 'Rôle').click()
    cy.contains('label', 'Coordinateur').click()
    cy.contains('button:visible', 'Valider').click()

    cy.location('search').should('equal', '?roles=coordinateur')
    cy.get('.fr-tags-group').contains('a', 'Coordinateur').click()
    cy.location('search').should('equal', '')
  })

  it('La case des anciens rattachements s’écrit dans l’URL', () => {
    cy.signin(administrateur)
    cy.visit(appUrl('/administration/utilisateurs'))
    cy.dsfrShouldBeStarted()

    cy.contains('label', 'Inclure les anciennes employeuses').click()

    cy.location('search').should('equal', '?historique=1')
  })
})
