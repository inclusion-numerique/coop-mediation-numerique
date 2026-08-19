import { appUrl } from '@app/e2e/support/helpers'
import { mediateurSansActivites } from '@app/fixtures/users/mediateurSansActivites'

/**
 * Couvre la bascule « Voir les RDVs » de la liste d'activités.
 *
 * Trois choses qu'aucun scénario Cucumber ne voit : que la case atteigne bien la
 * server action, que le réglage survive à un rechargement, et qu'un rendez-vous
 * apparaisse dans une liste jusque-là réservée aux activités.
 *
 * Le composant porte aussi le rattrapage des rendez-vous au chargement. Il n'est
 * pas armé ici — aucune organisation n'est en défaut de webhook — et c'est
 * volontaire : ce scénario éprouve la bascule, pas la synchronisation.
 */

const RDV = 9_900_300

describe('ETQ médiateur, je choisis de voir mes rendez-vous parmi mes activités', () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
    cy.execute('connectRdvAccountFor', { email: mediateurSansActivites.email })
    cy.execute('seedRdvsFor', {
      email: mediateurSansActivites.email,
      rdvs: [{ id: RDV + 1, statut: 'unknown', dansDesJours: 2 }],
    })
  })

  it('La bascule fait apparaître les rendez-vous et le réglage survit au rechargement', () => {
    cy.signin(mediateurSansActivites)
    cy.visit(appUrl('/coop/mes-activites'))

    // État initial : le réglage est à faux, aucun rendez-vous n'est listé.
    cy.execute('reglageRdvsDansActivitesFor', {
      email: mediateurSansActivites.email,
    }).then((reglage) => {
      expect(reglage?.includeRdvsInActivitesList).to.equal(false)
    })
    cy.contains('Rendez-vous').should('not.exist')

    cy.findByLabelText(/Voir les RDVs/).click()

    // La server action écrit le réglage : c'est lui, et non le paramètre d'URL,
    // qui doit porter l'affichage d'un rechargement à l'autre.
    cy.execute('reglageRdvsDansActivitesFor', {
      email: mediateurSansActivites.email,
    }).then((reglage) => {
      expect(reglage?.includeRdvsInActivitesList).to.equal(true)
    })

    cy.visit(appUrl('/coop/mes-activites'))

    cy.findByLabelText(/Voir les RDVs/).should('be.checked')
    cy.contains('Rendez-vous').should('be.visible')
    cy.contains('À venir').should('be.visible')
  })

  it('La bascule inverse retire les rendez-vous de la liste', () => {
    cy.signin(mediateurSansActivites)
    cy.visit(appUrl('/coop/mes-activites'))

    cy.findByLabelText(/Voir les RDVs/).click()
    cy.contains('Rendez-vous').should('be.visible')

    cy.findByLabelText(/Voir les RDVs/).click()

    cy.execute('reglageRdvsDansActivitesFor', {
      email: mediateurSansActivites.email,
    }).then((reglage) => {
      expect(reglage?.includeRdvsInActivitesList).to.equal(false)
    })

    cy.visit(appUrl('/coop/mes-activites'))
    cy.contains('Rendez-vous').should('not.exist')
  })
})
