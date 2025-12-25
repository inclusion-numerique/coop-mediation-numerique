import { executeInscriptionFlow } from '@app/e2e/e2e/inscription/executeInscriptionFlow'
import { shouldBeOnCoopHomepage } from '@app/e2e/support/helpers'
import { mediateurInscription } from '@app/fixtures/users/mediateurInscription'
import { previewBranchAuthFallbacks } from '@app/web/auth/previewBranchAuthFallbacks'
import { profileInscriptionLabels } from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'

describe("ETQ médiateur, je peux m'inscrire en suivant le bon parcours", () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
  })

  it("ETQ Médiateur, je peux m'inscrire en suivant le bon parcours", () => {
    executeInscriptionFlow({
      signin: true,
      user: mediateurInscription,
      expectSuccessToast: true,
      expectOnboarding: 'mediateur',
      skipOnboarding: true,
      expectedSteps: [
        {
          step: 'choisir-role',
          role: 'Mediateur',
          acceptCgu: true,
          check: () => {
            cy.contains(
              'Inscription à La Coop de la médiation numérique',
            ).should('be.visible')
            cy.contains(
              "Choisissez votre rôle afin de profiter d'un espace adapté à vos besoins.",
            ).should('be.visible')
            cy.contains(profileInscriptionLabels.Mediateur).should('be.visible')
            cy.contains(profileInscriptionLabels.Coordinateur).should(
              'be.visible',
            )
          },
        },
        {
          step: 'verifier-informations',
          accept: true,
          check: () => {
            cy.contains('Vérifiez vos informations').should('be.visible')
            cy.contains('Étape 1 sur 3').should('be.visible')
            cy.contains('Mes informations').should('be.visible')
            cy.contains('Profession').should('be.visible')
            cy.contains(profileInscriptionLabels.Mediateur).should('be.visible')
            cy.contains(profileInscriptionLabels.Coordinateur).should(
              'not.exist',
            )
            cy.contains('Nom').should('be.visible')
            cy.contains(mediateurInscription.name).should('be.visible')
            cy.get('main').contains('Adresse e-mail').should('be.visible')
            cy.get('main')
              .contains(mediateurInscription.email)
              .should('be.visible')
            cy.get('main')
              .contains('Ma structure employeuse')
              .should('be.visible')
            cy.get('main')
              .contains('AGENCE NATIONALE DE LA COHESION DES TERRITOIRES')
              .should('be.visible')
            cy.contains('Étape suivante').should('be.visible')
            cy.contains("Renseignez vos lieux d'activité").should('be.visible')
          },
        },
        {
          step: 'lieux-activite',
          structureEmployeuseIsLieuActivite: true,
          check: () => {
            cy.contains("Renseignez vos lieux d'activité").should('be.visible')
            cy.contains('Étape 2 sur 3').should('be.visible')
            cy.contains(
              "Est-ce que votre structure employeuse est également un de vos lieux d'activité",
            ).should('be.visible')
            cy.contains(
              "Vos lieux d'activité sont les lieux où vous accueillez et accompagnez vos bénéficiaires",
            ).should('be.visible')
            cy.get('button').contains('Oui').should('be.visible')
            cy.get('button').contains('Non').should('be.visible')
          },
        },
        {
          step: 'lieux-activite',
          check: () => {
            cy.contains("Renseignez vos lieux d'activité").should('be.visible')
            cy.contains('Étape 2 sur 3').should('be.visible')
            cy.contains(
              "Vos lieux d'activité sont les lieux où vous accueillez et accompagnez vos bénéficiaires",
            ).should('be.visible')
            cy.contains('Rechercher par nom du lieu, adresse ou SIRET.').should(
              'be.visible',
            )
          },
        },
        {
          step: 'recapitulatif',
          conseillerNumeriqueRoleNotice: 'none',
          check: () => {
            cy.contains('Récapitulatif de vos informations').should(
              'be.visible',
            )
            cy.contains(
              'Vérifiez que les informations sont exactes avant de valider votre inscription.',
            ).should('be.visible')
            cy.contains('Mes informations').should('be.visible')
            cy.contains('Profession').should('be.visible')
            cy.contains(profileInscriptionLabels.Mediateur).should('be.visible')
            cy.contains('Nom').should('be.visible')
            cy.contains(mediateurInscription.name).should('be.visible')
            cy.contains('Adresse e-mail').should('be.visible')
            cy.get('main')
              .contains(mediateurInscription.email)
              .should('be.visible')
            cy.contains('Ma structure employeuse').should('be.visible')
            cy.contains('Mon lieu d’activité').should('be.visible')
            cy.contains('Valider mon inscription').should('be.visible')
            // already validated cgu at start
            cy.contains('J’ai lu et j’accepte').should('not.exist')
          },
        },
      ],
    })
    shouldBeOnCoopHomepage()
  })
})
