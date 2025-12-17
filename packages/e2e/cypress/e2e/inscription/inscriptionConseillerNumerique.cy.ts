import { executeInscriptionFlow } from '@app/e2e/e2e/inscription/executeInscriptionFlow'
import { conseillerInscription } from '@app/fixtures/users/conseillerInscription'
import { conseillerSansLieuInscription } from '@app/fixtures/users/conseillerSansLieuInscription'

describe("ETQ Conseiller numérique, je peux m'inscrire en suivant le bon parcours", () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
  })

  it("ETQ Conseiller numérique avec lieux d'activité sur le dataspace, je vais directement au récapitulatif", () => {
    executeInscriptionFlow({
      signin: true,
      user: conseillerInscription,
      expectSuccessToast: true,
      expectOnboarding: 'mediateur',
      skipOnboarding: true,
      expectedSteps: [
        {
          step: 'recapitulatif',
          acceptCgu: true,
          check: () => {
            cy.contains('Récapitulatif de vos informations').should(
              'be.visible',
            )
            cy.contains('Mes informations').should('be.visible')
            cy.contains('Conseiller·ère numérique').should('be.visible')
            cy.contains(conseillerInscription.name).should('be.visible')
            cy.contains('Ma structure employeuse').should('be.visible')
            // lieux activite imported from dataspace
            cy.contains('Mes lieux d’activité').should('be.visible')
            cy.contains('Valider mon inscription').should('be.visible')
          },
        },
      ],
    })
  })

  it("ETQ Conseiller numérique sans lieux d'activité sur le dataspace, je dois renseigner mes lieux", () => {
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
})
