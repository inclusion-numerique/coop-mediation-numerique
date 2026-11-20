'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { semerLesCrasDeDemonstration } from '@/features/activites/fixtures/semer-les-cras-de-demonstration'
import { withAdmin, withAuth } from '@/features/authentification'
import { semerLesBeneficiairesDeDemonstration } from '@/features/beneficiaire/fixtures/semer-les-beneficiaires-de-demonstration'
import { semerLesCoordinationsDeDemonstration } from '@/features/equipe/fixtures/semer-les-coordinations-de-demonstration'
import { reinitialiserUneFixture } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture'
import { ReinitialiserUneFixtureValidation } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/action/reinitialiser-une-fixture.validation'
import { fromResult, withInput } from '@/libraries/nextjs'

export const reinitialiserUneFixtureAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ReinitialiserUneFixtureValidation))
  .execute(
    fromResult(
      ({ input }) =>
        reinitialiserUneFixture(input.utilisateurId, {
          semerLesBeneficiaires: semerLesBeneficiairesDeDemonstration,
          semerLesCras: semerLesCrasDeDemonstration,
          semerLesCoordinations: semerLesCoordinationsDeDemonstration,
        }),
      {
        onError: {
          CompteNonFixture: 'Seul un utilisateur de test se réinitialise',
        },
      },
    ),
  )
