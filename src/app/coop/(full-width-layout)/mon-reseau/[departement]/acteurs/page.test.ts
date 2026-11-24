import { appUrl } from '@e2e/support/helpers'
import { coordinateurInscrit } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit'

describe('ETQ coordinateur, je filtre les acteurs de mon département', () => {
  beforeEach(() => {
    cy.execute('preparerLesPersonas', { ids: [coordinateurInscrit.id] })
  })

  it('Un rôle validé filtre l’annuaire, et son étiquette le retire', () => {
    cy.signin(coordinateurInscrit)
    cy.visit(appUrl('/coop/mon-reseau/69/acteurs?page=2'))
    cy.dsfrShouldBeStarted()

    cy.contains('button', /^Rôle\s*$/).click()
    cy.contains('label', 'Coordinateur').click()
    cy.contains('button:visible', 'Valider').click()

    cy.location('search').should('equal', '?role=coordinateur')

    cy.get('.fr-tags-group').contains('a', 'Coordinateur').click()

    cy.location('search').should('equal', '')
    cy.contains('button', /^Rôle\s*$/).should('be.visible')
  })
})
