import { Sort } from '@arckit/resultset'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import type { ReactNode } from 'react'
import { ChampDeRecherche } from './ChampDeRecherche'
import { ChoixDuTri } from './ChoixDuTri'
import { triParmi } from './definition/tri-parmi'
import { LignesParPage } from './LignesParPage'

const monter = (adresse: string, champ: ReactNode) => {
  const ecrites: UrlUpdateEvent[] = []
  cy.mount(
    <NuqsTestingAdapter
      searchParams={adresse}
      hasMemory
      onUrlUpdate={(evenement) => ecrites.push(evenement)}
    >
      {champ}
    </NuqsTestingAdapter>,
  )
  return ecrites
}

const derniereAdresse = (ecrites: UrlUpdateEvent[]) =>
  cy
    .wrap(ecrites)
    .should('have.length.greaterThan', 0)
    .then(() => ecrites.at(-1)?.queryString)

const triDesTags = triParmi({
  colonnes: { nom: 'Nom', utilisation: 'Utilisation' },
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

const pagination = { lignes: [20, 50, 100], parDefaut: 20 }

describe('État d’une liste', () => {
  it('écrit le tri choisi sous ses deux clés et revient à la première page', () => {
    const ecrites = monter('?page=3', choixDuTri)
    cy.get('select').select('Nom de A à Z')
    derniereAdresse(ecrites).should('equal', '?tri=nom&ordre=asc')
  })

  it('efface le tri par défaut de l’URL', () => {
    const ecrites = monter('?tri=nom&ordre=asc', choixDuTri)
    cy.get('select').select('Les plus utilisés')
    derniereAdresse(ecrites).should('equal', '')
  })

  it('montre le tri de l’URL', () => {
    monter('?tri=nom&ordre=asc', choixDuTri)
    cy.get('select option:selected').should('have.text', 'Nom de A à Z')
  })

  it('écrit le nombre de lignes et revient à la première page', () => {
    const ecrites = monter('?page=3', <LignesParPage pagination={pagination} />)
    cy.get('select').select('50 lignes par page')
    derniereAdresse(ecrites).should('equal', '?lignes=50')
  })

  it('efface le nombre de lignes par défaut de l’URL', () => {
    const ecrites = monter(
      '?lignes=50',
      <LignesParPage pagination={pagination} />,
    )
    cy.get('select').select('20 lignes par page')
    derniereAdresse(ecrites).should('equal', '')
  })

  it('écrit la recherche validée et revient à la première page', () => {
    const ecrites = monter('?page=2', <ChampDeRecherche placeholder="Nom" />)
    cy.get('input').type('  maison {enter}')
    derniereAdresse(ecrites).should('equal', '?recherche=maison')
  })

  it('reprend la recherche de l’URL dans le champ', () => {
    monter('?recherche=maison', <ChampDeRecherche placeholder="Nom" />)
    cy.get('input').should('have.value', 'maison')
  })
})
