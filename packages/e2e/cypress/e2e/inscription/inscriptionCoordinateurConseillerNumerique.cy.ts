import { executeInscriptionFlow } from '@app/e2e/e2e/inscription/executeInscriptionFlow'
import { coordinateurInscription } from '@app/fixtures/users/coordinateurInscription'

describe('ETQ Coordinateur conseiller numérique, je peux m’inscrire en suivant le bon parcours', () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
  })

  it(`ETQ Coordinateur conseiller numérique, je peux m’inscrire en suivant le bon parcours`, () => {
    executeInscriptionFlow({
      signin: true,
      user: coordinateurInscription,
      expectSuccessToast: true,
      expectOnboarding: 'coordinateur',
      skipOnboarding: true,
      expectedSteps: [
        {
          step: 'recapitulatif',
          conseillerNumeriqueRoleNotice: 'coordinateur-conseiller-numerique',
          acceptCgu: true,
          check: () => {
            cy.contains('Récapitulatif de vos informations').should(
              'be.visible',
            )
            cy.contains('coordinateur·rice de conseillers numériques').should(
              'be.visible',
            )
            cy.contains('Mes informations').should('be.visible')
            cy.contains(coordinateurInscription.name).should('be.visible')
            cy.contains('Mon équipe').should('be.visible')
            cy.contains('Ma structure employeuse').should('be.visible')
            cy.contains('Valider mon inscription').should('be.visible')
          },
        },
      ],
    })
  })
})
