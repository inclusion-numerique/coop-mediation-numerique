import { executeInscriptionFlow } from '@app/e2e/e2e/inscription/executeInscriptionFlow'
import { conseillerInscriptionSansContrat } from '@app/fixtures/users/conseillerInscriptionSansContrat'
import { conseillerSansLieuInscription } from '@app/fixtures/users/conseillerSansLieuInscription'

/**
 * Un conseiller numérique renseigne TOUJOURS ses lieux d'activité à l'inscription.
 *
 * Ce fichier comptait auparavant un scénario « avec lieux d'activité sur le dataspace », qui allait
 * droit au récapitulatif : l'API Dataspace était censée fournir les lieux du dispositif, et le mock
 * e2e en renvoyait systématiquement. La production disait autre chose — sur 2 293 conseillers
 * numériques inscrits, **12 comptes** ont vu cet import se déclencher, et 5 seulement parmi les
 * conseillers. Le scénario décrivait donc le comportement du mock, pas celui du produit.
 *
 * L'API ayant disparu (le dispositif se lit désormais dans `main`), il ne reste qu'un parcours, et
 * c'est celui que 99,7 % des conseillers numériques vivaient déjà.
 */
describe("ETQ Conseiller numérique, je peux m'inscrire en suivant le bon parcours", () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
  })

  it('ETQ Conseiller numérique, je renseigne mes lieux puis je valide', () => {
    executeInscriptionFlow({
      signin: true,
      user: conseillerSansLieuInscription,
      expectSuccessToast: true,
      expectOnboarding: 'mediateur',
      skipOnboarding: true,
      expectedSteps: [
        {
          step: 'verifier-informations',
          accept: true,
          check: () => {
            cy.contains('Vérifiez vos informations').should('be.visible')
            cy.contains('Mes informations').should('be.visible')
            cy.contains('Conseiller·ère numérique').should('be.visible')
            cy.contains(conseillerSansLieuInscription.name).should('be.visible')
            cy.contains('Ma structure employeuse').should('be.visible')
          },
        },
        {
          step: 'lieux-activite',
          structureEmployeuseIsLieuActivite: true,
          check: () => {
            cy.contains("Renseignez vos lieux d'activité").should('be.visible')
            cy.contains(
              "Est-ce que votre structure employeuse est également un de vos lieux d'activité",
            ).should('be.visible')
          },
        },
        {
          step: 'lieux-activite',
          check: () => {
            cy.contains("Renseignez vos lieux d'activité").should('be.visible')
            cy.contains('Rechercher par nom du lieu, adresse ou SIRET.').should(
              'be.visible',
            )
          },
        },
        {
          step: 'recapitulatif',
          acceptCgu: true,
          conseillerNumeriqueRoleNotice: 'conseiller-numerique',
          check: () => {
            cy.contains('Récapitulatif de vos informations').should(
              'be.visible',
            )
            cy.contains('Mes informations').should('be.visible')
            cy.contains('Conseiller·ère numérique').should('be.visible')
            cy.contains(conseillerSansLieuInscription.name).should('be.visible')
            cy.contains('Ma structure employeuse').should('be.visible')

            // We added structure employeuse as lieu activite
            cy.contains('Mon lieu d’activité').should('be.visible')
            cy.contains('Valider mon inscription').should('be.visible')
          },
        },
      ],
    })
  })

  // L'absence de contrat actif ne doit pas empêcher l'inscription : le dispositif se lit à
  // l'affectation, pas au contrat, dont la couverture est partielle par construction (ADR-002).
  it("ETQ Conseiller numérique sans contrat actif, je peux m'inscrire", () => {
    executeInscriptionFlow({
      signin: true,
      user: conseillerInscriptionSansContrat,
      expectSuccessToast: true,
      expectOnboarding: 'mediateur',
      skipOnboarding: true,
      expectedSteps: [
        {
          step: 'verifier-informations',
          accept: true,
          check: () => {
            cy.contains('Vérifiez vos informations').should('be.visible')
            cy.contains('Conseiller·ère numérique').should('be.visible')
            cy.contains(conseillerInscriptionSansContrat.name).should(
              'be.visible',
            )
          },
        },
        {
          step: 'lieux-activite',
          structureEmployeuseIsLieuActivite: true,
          check: () => {
            cy.contains("Renseignez vos lieux d'activité").should('be.visible')
          },
        },
        {
          step: 'lieux-activite',
          check: () => {
            cy.contains("Renseignez vos lieux d'activité").should('be.visible')
          },
        },
        {
          step: 'recapitulatif',
          conseillerNumeriqueRoleNotice: 'conseiller-numerique',
          acceptCgu: true,
          check: () => {
            cy.contains('Récapitulatif de vos informations').should(
              'be.visible',
            )
            cy.contains('Conseiller·ère numérique').should('be.visible')
            cy.contains(conseillerInscriptionSansContrat.name).should(
              'be.visible',
            )
            cy.contains('Ma structure employeuse').should('be.visible')
            cy.contains('Mon lieu d’activité').should('be.visible')
            cy.contains('Valider mon inscription').should('be.visible')
          },
        },
      ],
    })
  })
})
