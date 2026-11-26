import { useState } from 'react'
import type { DepartementDuReferentiel } from '../departements'
import { ChoixDuDepartement } from './ChoixDuDepartement'

const rhone: DepartementDuReferentiel = { code: '69', nom: 'Rhône' }

const ChoixAvecSonResultat = () => {
  const [choisi, setChoisi] = useState<DepartementDuReferentiel | null>(null)

  return (
    <>
      <ChoixDuDepartement
        libelle="Département"
        indice="Le réseau du département choisi s’affiche"
        departement={rhone}
        onChoix={setChoisi}
      />
      <p className="choix">
        {choisi ? `Choisi : ${choisi.code}` : 'Aucun choix'}
      </p>
    </>
  )
}

describe('Choix du département', () => {
  it('nomme le champ par son étiquette', () => {
    cy.mount(<ChoixAvecSonResultat />)
    cy.findByRole('combobox', { name: /Département/ }).should('exist')
  })

  it('choisit au clavier le département mis en avant', () => {
    cy.mount(<ChoixAvecSonResultat />)
    cy.findByRole('combobox').clear().type('ardeche{downArrow}{enter}')
    cy.get('.choix').should('have.text', 'Choisi : 07')
  })

  it('choisit à la souris le département cliqué', () => {
    cy.mount(<ChoixAvecSonResultat />)
    cy.findByRole('combobox').clear().type('ardeche')
    cy.findByRole('option', { name: 'Ardèche · 07' }).click()
    cy.get('.choix').should('have.text', 'Choisi : 07')
  })

  it('ne choisit rien en parcourant la liste', () => {
    cy.mount(<ChoixAvecSonResultat />)
    cy.findByRole('combobox').clear().type('seine{downArrow}{downArrow}')
    cy.get('.choix').should('have.text', 'Aucun choix')
  })

  it('annonce le nombre de départements trouvés', () => {
    cy.mount(<ChoixAvecSonResultat />)
    cy.findByRole('combobox').clear().type('ardeche')
    cy.findByRole('status').should('have.text', '1 résultat')
  })

  it('annonce l’absence de département trouvé', () => {
    cy.mount(<ChoixAvecSonResultat />)
    cy.findByRole('combobox').clear().type('zzz')
    cy.findByRole('status').should('have.text', 'Aucun résultat')
  })

  it('cherche un département par son numéro', () => {
    cy.mount(<ChoixAvecSonResultat />)
    cy.findByRole('combobox').clear().type('2b')
    cy.findByRole('option').should('have.text', 'Haute-Corse · 2B')
  })
})
