import { executeInscriptionFlow } from '@app/e2e/e2e/inscription/executeInscriptionFlow'
import { shouldBeOnCoopHomepage } from '@app/e2e/support/helpers'
import { mediateurInscription } from '@app/fixtures/users/mediateurInscription'

describe.skip('ETQ médiateur, je peux m’inscrire en suivant le bon parcours', () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
  })

  it(`ETQ Médiateur, je peux m’inscrire en suivant le bon parcours`, () => {
    executeInscriptionFlow({
      signin: true,
      user: mediateurInscription,
      expectedSteps: [
        {
          step: 'recapitulatif',
        },
      ],
    })
    shouldBeOnCoopHomepage()
  })
})
