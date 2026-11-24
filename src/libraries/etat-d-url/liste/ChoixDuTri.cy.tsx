import { Sort } from '@arckit/resultset'
import { derniereAdresse, monterAvecLUrl } from '@e2e/support/monter-avec-l-url'
import { triParmi } from '../definition/tri-parmi'
import { ChoixDuTri } from './ChoixDuTri'

const triDesTags = triParmi({
  colonnes: ['nom', 'utilisation'],
  parDefaut: Sort('utilisation', 'desc'),
})

const choixDuTri = (
  <ChoixDuTri
    tri={triDesTags}
    options={[
      { libelle: 'Les plus utilisés', tri: Sort('utilisation', 'desc') },
      { libelle: 'Nom de A à Z', tri: Sort('nom', 'asc') },
    ]}
  />
)

const choixDuTriCroissant = (
  <ChoixDuTri
    tri={triParmi({
      colonnes: ['nom', 'date'],
      parDefaut: Sort('date', 'asc'),
    })}
    options={[
      { libelle: 'Par date', tri: Sort('date', 'asc') },
      { libelle: 'Nom de A à Z', tri: Sort('nom', 'asc') },
    ]}
  />
)

describe('Choix du tri', () => {
  it('écrit le tri choisi sous ses deux clés et revient à la première page', () => {
    const ecrites = monterAvecLUrl('?page=3', choixDuTri)
    cy.get('select').select('Nom de A à Z')
    derniereAdresse(ecrites).should('equal', '?tri=nom&ordre=asc')
  })

  it('n’écrit pas le sens quand il vaut le sens par défaut', () => {
    const ecrites = monterAvecLUrl('', choixDuTriCroissant)
    cy.get('select').select('Nom de A à Z')
    derniereAdresse(ecrites).should('equal', '?tri=nom')
  })

  it('efface le tri par défaut de l’URL', () => {
    const ecrites = monterAvecLUrl('?tri=nom&ordre=asc', choixDuTri)
    cy.get('select').select('Les plus utilisés')
    derniereAdresse(ecrites).should('equal', '')
  })

  it('montre le tri de l’URL', () => {
    monterAvecLUrl('?tri=nom&ordre=asc', choixDuTri)
    cy.get('select option:selected').should('have.text', 'Nom de A à Z')
  })
})
