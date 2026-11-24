import { appUrl } from '@e2e/support/helpers'
import { mediateurAvecActivite } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-avec-activite'

describe('ETQ médiateur, je filtre mes statistiques', () => {
  beforeEach(() => {
    cy.execute('preparerLesPersonas', { ids: [mediateurAvecActivite.id] })
  })

  it('Un type validé filtre les statistiques, et son étiquette le retire', () => {
    cy.signin(mediateurAvecActivite)
    cy.visit(appUrl('/coop/mes-statistiques'))
    cy.dsfrShouldBeStarted()

    cy.contains('button', 'Type').click()
    cy.contains('label', 'Atelier collectif').click()
    cy.contains('button:visible', 'Valider').click()

    cy.location('search').should('equal', '?types=collectif')
    cy.contains('button', 'Type · 1').should('be.visible')

    cy.get('.fr-tags-group').contains('a', 'Atelier collectif').click()

    cy.location('search').should('equal', '')
    cy.contains('button', /^Type\s*$/).should('be.visible')
  })
})
