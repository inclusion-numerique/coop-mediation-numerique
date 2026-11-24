import { derniereAdresse, monterAvecLUrl } from '@e2e/support/monter-avec-l-url'
import { filtreDeChoixUnique } from '../definition/filtre-de-choix'
import { CaseACocher } from './CaseACocher'

const filtreDeLHistorique = filtreDeChoixUnique({
  titre: 'Historique',
  cle: 'historique',
  choix: { avec: 'Avec les anciens' },
  dansLURL: { avec: '1' },
})

describe('Case à cocher', () => {
  it('écrit la case cochée dans l’URL et revient à la première page', () => {
    const ecrites = monterAvecLUrl(
      '?page=2',
      <CaseACocher
        filtre={filtreDeLHistorique}
        valeur="avec"
        libelle="Avec les anciens"
      />,
    )
    cy.contains('label', 'Avec les anciens').click()
    derniereAdresse(ecrites).should('equal', '?historique=1')
  })

  it('efface la case décochée de l’URL', () => {
    const ecrites = monterAvecLUrl(
      '?historique=1',
      <CaseACocher
        filtre={filtreDeLHistorique}
        valeur="avec"
        libelle="Avec les anciens"
      />,
    )
    cy.contains('label', 'Avec les anciens').click()
    derniereAdresse(ecrites).should('equal', '')
  })
})
