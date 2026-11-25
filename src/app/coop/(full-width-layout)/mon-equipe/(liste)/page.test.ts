import { appUrl } from '@e2e/support/helpers'
import { coordinateurInscrit } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit'

describe('ETQ coordinateur, je filtre mon équipe', () => {
  beforeEach(() => {
    cy.execute('preparerLesPersonas', { ids: [coordinateurInscrit.id] })
  })

  it('Un statut choisi filtre l’équipe, et un second clic le retire', () => {
    cy.signin(coordinateurInscrit)
    cy.visit(appUrl('/coop/mon-equipe'))
    cy.dsfrShouldBeStarted()

    cy.contains('button', 'Archivés').click()
    cy.location('search').should('equal', '?statut=archives')

    cy.contains('button', 'Archivés').click()
    cy.location('search').should('equal', '')
  })
})
