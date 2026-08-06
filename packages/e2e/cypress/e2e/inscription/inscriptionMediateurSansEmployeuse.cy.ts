import { executeInscriptionFlow } from '@app/e2e/e2e/inscription/executeInscriptionFlow'
import { shouldBeOnCoopHomepage } from '@app/e2e/support/helpers'
import { structureEmployeuse } from '@app/fixtures/structures'
import { mediateurSansEmployeuseInscription } from '@app/fixtures/users/mediateurSansEmployeuseInscription'
import { profileInscriptionLabels } from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'

/**
 * Seul parcours qui emprunte l'étape « renseigner votre structure employeuse » :
 * les autres médiateurs d'inscription portent un SIRET dont l'initialisation
 * déduit leur employeuse, ce qui saute l'étape.
 */
describe("ETQ médiateur sans employeuse, je la renseigne pendant l'inscription", () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
  })

  it('ETQ Médiateur sans employeuse, je la choisis puis je poursuis mon inscription', () => {
    executeInscriptionFlow({
      signin: true,
      user: mediateurSansEmployeuseInscription,
      expectSuccessToast: true,
      expectOnboarding: 'mediateur',
      skipOnboarding: true,
      expectedSteps: [
        {
          step: 'choisir-role',
          role: 'Mediateur',
          acceptCgu: true,
        },
        {
          step: 'verifier-informations',
          accept: true,
          check: () => {
            // Sans employeuse connue, la carte récapitulative n'a rien à montrer.
            cy.get('main')
              .contains('Ma structure employeuse')
              .should('not.exist')
          },
        },
        {
          step: 'renseigner-structure-employeuse',
          recherche: 'Exemple de structure',
          choix: structureEmployeuse.nom,
          check: () => {
            cy.contains('Renseignez votre structure employeuse').should(
              'be.visible',
            )
            cy.contains('Étape 2 sur 3').should('be.visible')
            cy.contains(
              'Rechercher par SIRET, nom ou adresse de votre structure',
            ).should('be.visible')
            // Le bouton n'est ouvert qu'une fois la structure choisie.
            cy.get('button').contains('Continuer').should('be.disabled')
          },
        },
        {
          step: 'lieux-activite',
          structureEmployeuseIsLieuActivite: true,
          check: () => {
            // L'employeuse choisie à l'étape précédente est bien celle qu'on
            // propose comme lieu d'activité : la preuve que le rattachement a
            // été enregistré.
            cy.contains(
              "Est-ce que votre structure employeuse est également un de vos lieux d'activité",
            ).should('be.visible')
            cy.contains(structureEmployeuse.nom).should('be.visible')
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
          conseillerNumeriqueRoleNotice: 'none',
          check: () => {
            cy.contains(profileInscriptionLabels.Mediateur).should('be.visible')
            cy.get('main')
              .contains('Ma structure employeuse')
              .should('be.visible')
            cy.get('main')
              .contains(structureEmployeuse.nom)
              .should('be.visible')
          },
        },
      ],
    })

    shouldBeOnCoopHomepage()
  })
})
