import { derniereAdresse, monterAvecLUrl } from '@e2e/support/monter-avec-l-url'
import { z } from 'zod'
import { filtreDeRecherche } from '../definition'
import { RechercheEnPopover } from './RechercheEnPopover'

const filtreDesLieux = filtreDeRecherche({
  titre: 'lieux',
  cle: 'lieux',
  schema: z.string(),
})

describe('Recherche en popover', () => {
  it('propose les suggestions puis cherche côté serveur', () => {
    const recherches: string[] = []
    const ecrites = monterAvecLUrl(
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
