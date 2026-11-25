import { derniereAdresse, monterAvecLUrl } from '@e2e/support/monter-avec-l-url'
import { filtreDeChoix } from '../definition'
import { BoutonDeChoix } from './BoutonDeChoix'

const filtreDuType = filtreDeChoix({
  titre: 'types',
  cle: 'types',
  choix: { individuel: 'Individuel', collectif: 'Collectif' },
})

describe('Bouton de choix', () => {
  it('ajoute la valeur du bouton aux choix de l’URL', () => {
    const ecrites = monterAvecLUrl(
      '?types=individuel&page=2',
      <BoutonDeChoix filtre={filtreDuType} valeur="collectif">
        Collectif
      </BoutonDeChoix>,
    )
    cy.contains('button', 'Collectif').click()
    derniereAdresse(ecrites).should('equal', '?types=individuel,collectif')
  })

  it('retire la valeur d’un bouton déjà choisi', () => {
    const ecrites = monterAvecLUrl(
      '?types=individuel,collectif',
      <BoutonDeChoix filtre={filtreDuType} valeur="collectif">
        Collectif
      </BoutonDeChoix>,
    )
    cy.contains('button', 'Collectif').click()
    derniereAdresse(ecrites).should('equal', '?types=individuel')
  })
})
