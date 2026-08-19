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

/**
 * La case DSFR masque son `input` natif, ce qui oblige à cliquer en `force` — et
 * `force` court-circuite l'attente d'actionnabilité de Cypress. Un clic parti
 * avant l'hydratation modifie le DOM sans que React ne voie rien : le réglage
 * n'est jamais écrit, et l'échec se présente comme une liste qui ne change pas.
 *
 * `data-fr-js` est posé sur `<html>` quand le JS du DSFR a démarré côté client,
 * ce qui n'arrive qu'une fois le bundle exécuté. Même famille de garde que
 * `dsfrModalsShouldBeBound`.
 */
const attendreHydratation = () =>
  cy.get('html').should('have.attr', 'data-fr-js', 'true')

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

    attendreHydratation()
    cy.get(CASE_VOIR_RDVS).click({ force: true })

    // Sans rechargement : la bascule doit rafraîchir la liste sur place. Le
    // `router.replace` ne suffit pas quand l'URL ne change pas, et le réglage
    // était enregistré sans que l'écran ne montre rien.
    cy.contains('Rendez-vous').should('be.visible')

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
    // Le réglage part de « activé » : l'état initial est ainsi rendu par le
    // serveur, et le scénario n'éprouve que le sens qu'il annonce.
    cy.execute('seedRdvsFor', {
      email: mediateurAvecActivite.email,
      voirRdvs: true,
      rdvs: [{ id: RDV + 2, statut: 'unknown', dansDesJours: 2 }],
    })

    cy.signin(mediateurAvecActivite)
    cy.visit(appUrl('/coop/mes-activites'))

    cy.get(CASE_VOIR_RDVS).should('be.checked')
    cy.contains('Rendez-vous').should('be.visible')

    attendreHydratation()
    cy.get(CASE_VOIR_RDVS).click({ force: true })

    // Sur place, sans rechargement : le rafraîchissement doit valoir dans les
    // deux sens.
    cy.contains('Rendez-vous').should('not.exist')

    cy.execute('reglageRdvsDansActivitesFor', {
      email: mediateurAvecActivite.email,
    }).then((reglage) => {
      expect(reglage?.includeRdvsInActivitesList).to.equal(false)
    })
  })
})
