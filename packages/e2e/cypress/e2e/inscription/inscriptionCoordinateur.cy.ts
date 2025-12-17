import { executeInscriptionFlow } from '@app/e2e/e2e/inscription/executeInscriptionFlow'
import { coordinateurHorsDispositifInscription } from '@app/fixtures/users/coordinateurHorsDispositifInscription'

describe("ETQ Coordinateur hors dispositif, je peux m'inscrire en suivant le bon parcours", () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
  })

  it("ETQ Coordinateur hors dispositif, je peux m'inscrire en suivant le bon parcours", () => {
    executeInscriptionFlow({
      signin: true,
      user: coordinateurHorsDispositifInscription,
      expectSuccessToast: true,
      expectOnboarding: 'coordinateur',
      skipOnboarding: true,
      expectedSteps: [
        {
          step: 'recapitulatif',
          acceptCgu: true,
          check: () => {
            cy.contains('Récapitulatif de vos informations').should(
              'be.visible',
            )
            cy.contains('coordinateur·rice de conseillers numériques').should(
              'be.visible',
            )
            cy.contains('Mes informations').should('be.visible')
            cy.contains(coordinateurHorsDispositifInscription.name).should(
              'be.visible',
            )
            // Coordinateur hors dispositif does not have Mon équipe section
            cy.contains('Mon équipe').should('not.exist')
            cy.contains('Ma structure employeuse').should('be.visible')
          },
        },
      ],
    })
  })
})
