import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import { type ReactNode, useState } from 'react'
import { z } from 'zod'
import { ChoixEnLigne } from './ChoixEnLigne'
import { ChoixEnPopover } from './ChoixEnPopover'
import {
  filtreDeChoix,
  filtreDeChoixUnique,
} from './definition/filtre-de-choix'
import { filtreDeRecherche } from './definition/filtre-de-recherche'
import { FiltresEnModale } from './FiltresEnModale'
import { RechercheEnPopover } from './RechercheEnPopover'

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

const filtreDesLieux = filtreDeRecherche({
  titre: 'lieux',
  cle: 'lieux',
  schema: z.string(),
})

const monter = (adresse: string, champ: ReactNode) => {
  const ecrites: UrlUpdateEvent[] = []
  cy.mount(
    <div data-cy="zone">
      <NuqsTestingAdapter
        searchParams={adresse}
        hasMemory
        onUrlUpdate={(evenement) => ecrites.push(evenement)}
      >
        {champ}
      </NuqsTestingAdapter>
    </div>,
  )
  return ecrites
}

const derniereAdresse = (ecrites: UrlUpdateEvent[]) =>
  cy
    .wrap(ecrites)
    .should('have.length.greaterThan', 0)
    .then(() => ecrites.at(-1)?.queryString)

const choixDuType = (
  <ChoixEnPopover
    titre="Type"
    sections={[{ filtre: filtreDuType, legende: 'Filtrer par :' }]}
  />
)

const filtreDuStatut = filtreDeChoix({
  titre: 'rdvs',
  cle: 'rdvs',
  choix: { seen: 'Honoré', noshow: 'Absence' },
})

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

describe('Filtres', () => {
  it('survit à l’ajout d’un filtre au popover', () => {
    monter('?types=individuel', <TypeAvecStatutsAJouter />)
    cy.contains('button', 'Ajouter les statuts').click()
    cy.contains('button', 'Type · 1').should('be.visible')
  })

  it('compte les choix lus dans l’URL', () => {
    monter('?types=individuel,collectif', choixDuType)
    cy.contains('button', 'Type · 2').should('exist')
  })

  it('n’écrit rien tant que le brouillon n’est pas validé', () => {
    const ecrites = monter('', choixDuType)
    cy.contains('button', 'Type').click()
    cy.contains('label', 'Collectif').click()
    cy.get('[data-cy=zone]').should('exist')
    cy.wrap(ecrites).should('have.length', 0)
  })

  it('écrit les choix validés et revient à la première page', () => {
    const ecrites = monter('?page=3&lignes=20', choixDuType)
    cy.contains('button', 'Type').click()
    cy.contains('label', 'Collectif').click()
    cy.contains('button', 'Valider').click()
    derniereAdresse(ecrites).should('equal', '?lignes=20&types=collectif')
  })

  it('efface les choix', () => {
    const ecrites = monter('?types=individuel', choixDuType)
    cy.contains('button', 'Type').click()
    cy.contains('button', 'Effacer').click()
    derniereAdresse(ecrites).should('equal', '')
  })

  it('écrit en une fois les champs d’une modale', () => {
    const ecrites = monter(
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

  it('propose les suggestions puis cherche côté serveur', () => {
    const recherches: string[] = []
    const ecrites = monter(
      '',
      <RechercheEnPopover
        titre="Lieu"
        filtre={filtreDesLieux}
        libelle="Rechercher un lieu"
        placeholder="Nom du lieu"
        selection={{ singular: 'lieu', plural: 'lieux' }}
        choisies={[]}
        suggestions={[{ value: 'a', label: 'Médiathèque' }]}
        rechercher={async ({ recherche }) => {
          recherches.push(recherche)
          return {
            success: true,
            data: [{ value: 'b', label: 'Tiers-lieu du Port' }],
          }
        }}
      />,
    )
    cy.contains('button', 'Lieu').click()
    cy.get('input[placeholder="Nom du lieu"]').click()
    cy.contains('Médiathèque').click()
    cy.get('input[placeholder="Nom du lieu"]').type('Port')
    cy.contains('Tiers-lieu du Port').click()
    cy.contains('button', 'Valider').click()
    cy.wrap(recherches).should('deep.equal', ['Por', 'Port'])
    derniereAdresse(ecrites).should('equal', '?lieux=a,b')
  })
})
