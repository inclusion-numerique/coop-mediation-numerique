import { appUrl } from '@app/e2e/support/helpers'
import { mediateurSansActivites } from '@app/fixtures/users/mediateurSansActivites'

/**
 * Couvre le bloc RDV Service Public de l'accueil.
 *
 * Ce que les scénarios Cucumber ne voient pas : les compteurs sont du SQL, et
 * ils ont longtemps classé sur la seule date. Un rendez-vous annulé restait
 * compté « à venir » tant que son horaire ne l'était pas, et pouvait même être
 * mis en avant comme prochain — un médiateur se voyait annoncer un rendez-vous
 * qui n'aurait pas lieu.
 *
 * Le jeu de données croise donc volontairement statut et chronologie : c'est la
 * seule combinaison qui distingue un filtre correct d'un filtre sur la date.
 */

const RDV = 9_900_200

describe('ETQ médiateur, l’accueil ne m’annonce que les rendez-vous qui auront lieu', () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
    cy.execute('connectRdvAccountFor', { email: mediateurSansActivites.email })
  })

  it('Un rendez-vous annulé n’est ni compté ni mis en avant', () => {
    cy.execute('seedRdvsFor', {
      email: mediateurSansActivites.email,
      rdvs: [
        // Le plus proche dans le temps, mais annulé : le piège du classement
        // par date seule.
        { id: RDV + 1, statut: 'revoked', dansDesJours: 1 },
        { id: RDV + 2, statut: 'excused', dansDesJours: 2 },
        { id: RDV + 3, statut: 'unknown', dansDesJours: 3 },
      ],
    })

    cy.signin(mediateurSansActivites)
    cy.visit(appUrl('/coop'))

    cy.contains('RDV Service Public').should('be.visible')

    cy.contains('Rdv à venir')
      .closest('div')
      .parent()
      .should('contain.text', '1')

    // Le rendez-vous mis en avant doit être le seul qui aura lieu, pas le plus
    // proche dans le temps.
    cy.contains('Prochain le').should('be.visible')
  })

  it('Un rendez-vous déjà honoré ne compte plus comme à venir', () => {
    cy.execute('seedRdvsFor', {
      email: mediateurSansActivites.email,
      rdvs: [
        { id: RDV + 4, statut: 'seen', dansDesJours: 1 },
        { id: RDV + 5, statut: 'noshow', dansDesJours: 2 },
      ],
    })

    cy.signin(mediateurSansActivites)
    cy.visit(appUrl('/coop'))

    cy.contains('RDV Service Public').should('be.visible')
    cy.contains('Prochain le').should('not.exist')
  })

  it('Un rendez-vous honoré sans compte rendu est réclamé', () => {
    cy.execute('seedRdvsFor', {
      email: mediateurSansActivites.email,
      rdvs: [{ id: RDV + 6, statut: 'seen', dansDesJours: -2 }],
    })

    cy.signin(mediateurSansActivites)
    cy.visit(appUrl('/coop'))

    cy.contains('Rdv passés').should('be.visible')
    cy.contains('Vous n’avez pas de rendez-vous passés').should('not.exist')
  })

  it('Un rendez-vous dont le compte rendu est réglé n’est plus réclamé', () => {
    cy.execute('seedRdvsFor', {
      email: mediateurSansActivites.email,
      rdvs: [
        {
          id: RDV + 7,
          statut: 'seen',
          dansDesJours: -2,
          compteRenduRegle: true,
        },
      ],
    })

    cy.signin(mediateurSansActivites)
    cy.visit(appUrl('/coop'))

    cy.contains('Vous n’avez pas de rendez-vous passés').should('be.visible')
  })
})
