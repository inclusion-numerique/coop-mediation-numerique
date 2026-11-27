import { appUrl } from '@e2e/support/helpers'
import { mediateurAvecActivite } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-avec-activite'

const CASE_VOIR_RDVS = '#include-rdvs-in-activites-list'

const RDV = 9_900_300

const attendreHydratation = () => cy.dsfrShouldBeStarted()

describe('ETQ médiateur, je choisis de voir mes rendez-vous parmi mes activités', () => {
  beforeEach(() => {
    cy.execute('preparerLesPersonas', { ids: [mediateurAvecActivite.id] })
    cy.execute('connectRdvAccountFor', { email: mediateurAvecActivite.email })
    cy.execute('seedRdvsFor', {
      email: mediateurAvecActivite.email,
      rdvs: [{ id: RDV + 1, statut: 'unknown', dansDesJours: 2 }],
    })
  })

  it('La bascule fait apparaître les rendez-vous et le réglage survit au rechargement', () => {
    cy.signin(mediateurAvecActivite)
    cy.visit(appUrl('/coop/mes-activites'))

    cy.execute('reglageRdvsDansActivitesFor', {
      email: mediateurAvecActivite.email,
    }).then((reglage) => {
      expect(reglage?.includeRdvsInActivitesList).to.equal(false)
    })
    cy.contains('Rendez-vous').should('not.exist')

    attendreHydratation()
    cy.get(CASE_VOIR_RDVS).click({ force: true })

    cy.contains('Rendez-vous').should('be.visible')

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

    cy.contains('Rendez-vous').should('not.exist')

    cy.execute('reglageRdvsDansActivitesFor', {
      email: mediateurAvecActivite.email,
    }).then((reglage) => {
      expect(reglage?.includeRdvsInActivitesList).to.equal(false)
    })
  })
})

describe('ETQ médiateur, je filtre mes activités', () => {
  beforeEach(() => {
    cy.execute('preparerLesPersonas', { ids: [mediateurAvecActivite.id] })
  })

  it('Un type validé filtre la liste, et son étiquette le retire', () => {
    cy.signin(mediateurAvecActivite)
    cy.visit(appUrl('/coop/mes-activites?page=2'))
    attendreHydratation()

    cy.contains('button', 'Type').click()
    cy.contains('label', 'Atelier collectif').click()
    cy.contains('button:visible', 'Valider').click()

    cy.location('search').should('equal', '?types=collectif')
    cy.contains('button', 'Type · 1').should('be.visible')

    cy.get('.fr-tags-group').contains('a', 'Atelier collectif').click()

    cy.location('search').should('equal', '')
    cy.contains('button', /^Type\s*$/).should('be.visible')
  })
})
