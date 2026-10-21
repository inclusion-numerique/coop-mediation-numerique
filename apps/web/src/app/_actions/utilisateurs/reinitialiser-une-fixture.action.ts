'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { reinitialiserUneFixture } from '@app/web/features/utilisateurs/abilities/reinitialiser-une-fixture'
import { ReinitialiserUneFixtureValidation } from '@app/web/features/utilisateurs/abilities/reinitialiser-une-fixture/action/reinitialiser-une-fixture.validation'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const reinitialiserUneFixtureAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ReinitialiserUneFixtureValidation))
  .execute(
    fromResult(({ input }) => reinitialiserUneFixture(input.utilisateurId), {
      onError: {
        CompteNonFixture: 'Seul un utilisateur de test se réinitialise',
      },
    }),
  )
