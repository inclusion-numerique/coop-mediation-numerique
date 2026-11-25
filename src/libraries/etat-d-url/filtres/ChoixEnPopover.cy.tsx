import { derniereAdresse, monterAvecLUrl } from '@e2e/support/monter-avec-l-url'
import { useState } from 'react'
import { filtreDeChoix } from '../definition'
import { ChoixEnPopover } from './ChoixEnPopover'

const filtreDuType = filtreDeChoix({
  titre: 'types',
  cle: 'types',
  choix: { individuel: 'Individuel', collectif: 'Collectif' },
})

const filtreDuStatut = filtreDeChoix({
  titre: 'rdvs',
  cle: 'rdvs',
  choix: { seen: 'Honoré', noshow: 'Absence' },
})

const choixDuType = (
  <ChoixEnPopover
    titre="Type"
    sections={[{ filtre: filtreDuType, legende: 'Filtrer par :' }]}
  />
)

const TypeAvecStatutsAJouter = () => {
  const [avecStatuts, setAvecStatuts] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setAvecStatuts(true)}>
        Ajouter les statuts
      </button>
      <ChoixEnPopover
        titre="Type"
        sections={[
          { filtre: filtreDuType, legende: 'Type' },
          ...(avecStatuts
            ? [{ filtre: filtreDuStatut, legende: 'Statut' }]
            : []),
        ]}
      />
    </>
  )
}

describe('Choix en popover', () => {
  it('survit à l’ajout d’un filtre au popover', () => {
    monterAvecLUrl('?types=individuel', <TypeAvecStatutsAJouter />)
    cy.contains('button', 'Ajouter les statuts').click()
    cy.contains('button', 'Type · 1').should('be.visible')
  })

  it('compte les choix lus dans l’URL', () => {
    monterAvecLUrl('?types=individuel,collectif', choixDuType)
    cy.contains('button', 'Type · 2').should('exist')
  })

  it('n’écrit rien tant que le brouillon n’est pas validé', () => {
    const ecrites = monterAvecLUrl('', choixDuType)
    cy.contains('button', 'Type').click()
    cy.contains('label', 'Collectif').click()
    cy.get('[data-cy=zone]').should('exist')
    cy.wrap(ecrites).should('have.length', 0)
  })

  it('écrit les choix validés et revient à la première page', () => {
    const ecrites = monterAvecLUrl('?page=3&lignes=20', choixDuType)
    cy.contains('button', 'Type').click()
    cy.contains('label', 'Collectif').click()
    cy.contains('button', 'Valider').click()
    derniereAdresse(ecrites).should('equal', '?lignes=20&types=collectif')
  })

  it('efface les choix', () => {
    const ecrites = monterAvecLUrl('?types=individuel', choixDuType)
    cy.contains('button', 'Type').click()
    cy.contains('button', 'Effacer').click()
    derniereAdresse(ecrites).should('equal', '')
  })
})
