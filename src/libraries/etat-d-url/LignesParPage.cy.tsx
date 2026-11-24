import { derniereAdresse, monterAvecLUrl } from '@e2e/support/monter-avec-l-url'
import { LignesParPage } from './LignesParPage'

const pagination = { lignes: [20, 50, 100], parDefaut: 20 }

describe('Lignes par page', () => {
  it('écrit le nombre de lignes et revient à la première page', () => {
    const ecrites = monterAvecLUrl(
      '?page=3',
      <LignesParPage pagination={pagination} />,
    )
    cy.get('select').select('50 lignes par page')
    derniereAdresse(ecrites).should('equal', '?lignes=50')
  })

  it('efface le nombre de lignes par défaut de l’URL', () => {
    const ecrites = monterAvecLUrl(
      '?lignes=50',
      <LignesParPage pagination={pagination} />,
    )
    cy.get('select').select('20 lignes par page')
    derniereAdresse(ecrites).should('equal', '')
  })
})
