import { appUrl } from '@app/e2e/support/helpers'
import { mediateurAvecActivite } from '@app/fixtures/users/mediateurAvecActivite'

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
 *
 * Le médiateur doit avoir des activités : la barre d'outils qui porte la case
 * n'est rendue que si la liste n'est pas vide (`MesActivitesListePage`), et un
 * rendez-vous seul ne la remplit pas tant que la bascule est à faux.
 */

/**
 * Identifiant posé par `UpdateIncludeRdvsInActivitesList` sur son `input`.
 * Recopié plutôt qu'importé, comme l'identifiant de modale du scénario de
 * déconnexion : importer le composant embarquerait React dans le spec.
 *
 * Visé par l'identifiant et non par le label : le DSFR masque l'`input` natif au
 * profit de son habillage, et une recherche par rôle ou par label ne le retrouve
 * pas de façon fiable.
 */
const CASE_VOIR_RDVS = '#include-rdvs-in-activites-list'

const RDV = 9_900_300

describe('ETQ médiateur, je choisis de voir mes rendez-vous parmi mes activités', () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
    cy.execute('connectRdvAccountFor', { email: mediateurAvecActivite.email })
    cy.execute('seedRdvsFor', {
      email: mediateurAvecActivite.email,
      rdvs: [{ id: RDV + 1, statut: 'unknown', dansDesJours: 2 }],
    })
  })

  it('La bascule fait apparaître les rendez-vous et le réglage survit au rechargement', () => {
    cy.signin(mediateurAvecActivite)
    cy.visit(appUrl('/coop/mes-activites'))

    // État initial : le réglage est à faux, aucun rendez-vous n'est listé.
    cy.execute('reglageRdvsDansActivitesFor', {
      email: mediateurAvecActivite.email,
    }).then((reglage) => {
      expect(reglage?.includeRdvsInActivitesList).to.equal(false)
    })
    cy.contains('Rendez-vous').should('not.exist')

    cy.get(CASE_VOIR_RDVS).click({ force: true })

    // La server action écrit le réglage : c'est lui, et non le paramètre d'URL,
    // qui doit porter l'affichage d'un rechargement à l'autre.
    cy.execute('reglageRdvsDansActivitesFor', {
      email: mediateurAvecActivite.email,
    }).then((reglage) => {
      expect(reglage?.includeRdvsInActivitesList).to.equal(true)
    })

    cy.visit(appUrl('/coop/mes-activites'))

    cy.get(CASE_VOIR_RDVS).should('be.checked')
    cy.contains('Rendez-vous').should('be.visible')
    cy.contains('À venir').should('be.visible')
  })

  it('La bascule inverse retire les rendez-vous de la liste', () => {
    cy.signin(mediateurAvecActivite)
    cy.visit(appUrl('/coop/mes-activites'))

    cy.get(CASE_VOIR_RDVS).click({ force: true })
    cy.contains('Rendez-vous').should('be.visible')

    cy.get(CASE_VOIR_RDVS).click({ force: true })

    cy.execute('reglageRdvsDansActivitesFor', {
      email: mediateurAvecActivite.email,
    }).then((reglage) => {
      expect(reglage?.includeRdvsInActivitesList).to.equal(false)
    })

    cy.visit(appUrl('/coop/mes-activites'))
    cy.contains('Rendez-vous').should('not.exist')
  })
})
