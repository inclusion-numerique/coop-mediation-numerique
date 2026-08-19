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
 * Les assertions portent sur des phrases entières rendues à l'écran plutôt que
 * sur des compteurs atteints en remontant le DOM : la structure du bloc peut
 * changer sans que le comportement bouge, et l'inverse doit rester détectable.
 */

const RDV = 9_900_200

describe('ETQ médiateur, l’accueil ne m’annonce que les rendez-vous qui auront lieu', () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
    cy.execute('connectRdvAccountFor', { email: mediateurSansActivites.email })
  })

  it('Des rendez-vous tous annulés n’en mettent aucun en avant', () => {
    cy.execute('seedRdvsFor', {
      email: mediateurSansActivites.email,
      rdvs: [
        { id: RDV + 1, statut: 'revoked', dansDesJours: 1 },
        { id: RDV + 2, statut: 'excused', dansDesJours: 2 },
      ],
    })

    cy.signin(mediateurSansActivites)
    cy.visit(appUrl('/coop'))

    cy.contains('RDV Service Public').should('be.visible')
    // Avant correctif, le plus proche des deux annulés était annoncé ici.
    cy.contains('Prochain le').should('not.exist')
  })

  it('Un rendez-vous déjà statué n’est pas annoncé comme prochain', () => {
    cy.execute('seedRdvsFor', {
      email: mediateurSansActivites.email,
      rdvs: [
        { id: RDV + 3, statut: 'seen', dansDesJours: 1 },
        { id: RDV + 4, statut: 'noshow', dansDesJours: 2 },
      ],
    })

    cy.signin(mediateurSansActivites)
    cy.visit(appUrl('/coop'))

    cy.contains('RDV Service Public').should('be.visible')
    cy.contains('Prochain le').should('not.exist')
  })

  it('Un rendez-vous qui aura lieu est annoncé, même entouré d’annulés', () => {
    cy.execute('seedRdvsFor', {
      email: mediateurSansActivites.email,
      rdvs: [
        { id: RDV + 5, statut: 'revoked', dansDesJours: 1 },
        { id: RDV + 6, statut: 'unknown', dansDesJours: 3 },
      ],
    })

    cy.signin(mediateurSansActivites)
    cy.visit(appUrl('/coop'))

    cy.contains('Prochain le').should('be.visible')
  })

  it('Un rendez-vous honoré sans compte rendu est réclamé', () => {
    cy.execute('seedRdvsFor', {
      email: mediateurSansActivites.email,
      rdvs: [{ id: RDV + 7, statut: 'seen', dansDesJours: -2 }],
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
          id: RDV + 8,
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
