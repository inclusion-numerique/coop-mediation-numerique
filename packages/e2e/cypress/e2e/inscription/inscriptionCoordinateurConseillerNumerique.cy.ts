import { executeInscriptionFlow } from '@app/e2e/e2e/inscription/executeInscriptionFlow'
import { shouldBeOnCoopHomepage } from '@app/e2e/support/helpers'
import { coordinateurInscription } from '@app/fixtures/users/coordinateurInscription'

describe.skip('ETQ Coordinateur conseiller numérique, je peux m’inscrire en suivant le bon parcours', () => {
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
        },
      ],
    })
    shouldBeOnCoopHomepage()
  })
})
