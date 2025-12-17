import { executeInscriptionFlow } from '@app/e2e/e2e/inscription/executeInscriptionFlow'
import { shouldBeOnCoopHomepage } from '@app/e2e/support/helpers'
import { conseillerInscription } from '@app/fixtures/users/conseillerInscription'

describe.skip('ETQ Conseiller numérique, je peux m’inscrire en suivant le bon parcours', () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
  })

  it(`ETQ Conseiller numérique avec données sur le dataspace, je peux m’inscrire en tant que conseiller numérique`, () => {
    executeInscriptionFlow({
      signin: true,
      user: conseillerInscription,
      expectSuccessToast: true,
      expectOnboarding: 'mediateur',
      skipOnboarding: true,
      expectedSteps: [
        {
          step: 'verifier-informations',
          accept: true,
        },
      ],
    })

    shouldBeOnCoopHomepage()
  })
})
