import { appUrl } from '@e2e/support/helpers'
import { mediateurAvecActivite } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-avec-activite'

describe('ETQ médiateur, je trie mes tags', () => {
  beforeEach(() => {
    cy.execute('preparerLesPersonas', { ids: [mediateurAvecActivite.id] })
  })

  it('Le tri choisi s’écrit dans l’URL, et le tri par défaut l’en retire', () => {
    cy.signin(mediateurAvecActivite)
    cy.visit(appUrl('/coop/tags?page=2'))
    cy.dsfrShouldBeStarted()

    cy.contains('label', 'Trier par').find('select').select('Visibilité')
    cy.location('search').should('equal', '?tri=visibilite')

    cy.contains('label', 'Trier par')
      .find('select')
      .select('Ordre alphabétique')
    cy.location('search').should('equal', '')
  })
})
