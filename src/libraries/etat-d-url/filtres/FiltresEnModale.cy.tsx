import { derniereAdresse, monterAvecLUrl } from '@e2e/support/monter-avec-l-url'
import {
  filtreDeChoix,
  filtreDeChoixUnique,
} from '../definition/filtre-de-choix'
import { ChoixEnLigne } from './ChoixEnLigne'
import { FiltresEnModale } from './FiltresEnModale'

const filtreDuType = filtreDeChoix({
  titre: 'types',
  cle: 'types',
  choix: { individuel: 'Individuel', collectif: 'Collectif' },
})

const filtreDeLaSource = filtreDeChoixUnique({
  titre: 'source',
  cle: 'source',
  choix: { v1: 'Import', v2: 'Coop' },
})

describe('Filtres en modale', () => {
  it('écrit en une fois les champs d’une modale', () => {
    const ecrites = monterAvecLUrl(
      '',
      <FiltresEnModale
        titre="Plus de filtres"
        filtres={[filtreDuType, filtreDeLaSource]}
      >
        <ChoixEnLigne filtre={filtreDuType} legende="Type" />
        <ChoixEnLigne filtre={filtreDeLaSource} legende="Source" />
      </FiltresEnModale>,
    )
    cy.contains('button', 'Plus de filtres').click()
    cy.contains('label', 'Individuel').click()
    cy.contains('label', 'Coop').click()
    cy.contains('button', 'Valider').click()
    derniereAdresse(ecrites).should('equal', '?types=individuel&source=v2')
    cy.wrap(ecrites).should('have.length', 1)
  })
})
