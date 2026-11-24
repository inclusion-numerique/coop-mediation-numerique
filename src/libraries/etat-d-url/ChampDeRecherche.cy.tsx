import { derniereAdresse, monterAvecLUrl } from '@e2e/support/monter-avec-l-url'
import { ChampDeRecherche } from './ChampDeRecherche'

describe('Champ de recherche', () => {
  it('écrit la recherche validée et revient à la première page', () => {
    const ecrites = monterAvecLUrl(
      '?page=2',
      <ChampDeRecherche placeholder="Nom" />,
    )
    cy.get('input').type('  maison {enter}')
    derniereAdresse(ecrites).should('equal', '?recherche=maison')
  })

  it('reprend la recherche de l’URL dans le champ', () => {
    monterAvecLUrl('?recherche=maison', <ChampDeRecherche placeholder="Nom" />)
    cy.get('input').should('have.value', 'maison')
  })
})
