'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { semerLesCrasDeDemonstration } from '@/features/activites/fixtures/semer-les-cras-de-demonstration'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { referencesDesBeneficiaires } from '@/features/beneficiaire/fixtures/beneficiaires-de-demonstration'
import { semerLesBeneficiairesDeDemonstration } from '@/features/beneficiaire/fixtures/semer-les-beneficiaires-de-demonstration'
import { semerLesCoordinationsDeDemonstration } from '@/features/equipe/fixtures/semer-les-coordinations-de-demonstration'
import { semerLesActivitesDuPersonaDansLesLieux } from '@/features/lieux-activite/fixtures/activites-dans-les-lieux-de-demonstration'
import {
  mediateque,
  structureEmployeuse,
} from '@/features/lieux-activite/fixtures/lieux-de-demonstration'
import { reinitialiserUneFixture } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture'
import { ReinitialiserUneFixtureValidation } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/action/reinitialiser-une-fixture.validation'
import { mediateursDesPersonas } from '@/features/utilisateurs/fixtures/personas'
import { fromResult, withInput } from '@/libraries/nextjs'

export const reinitialiserUneFixtureAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ReinitialiserUneFixtureValidation))
  .execute(
    fromResult(
      ({ input }) =>
        reinitialiserUneFixture(input.utilisateurId, {
          employeuse: { structureCoopId: structureEmployeuse.id },
          semerLesActivitesDansLesLieux: semerLesActivitesDuPersonaDansLesLieux(
            mediateursDesPersonas,
          ),
          semerLesBeneficiaires: semerLesBeneficiairesDeDemonstration(
            mediateursDesPersonas,
          ),
          semerLesCras: semerLesCrasDeDemonstration({
            mediateurs: mediateursDesPersonas,
            beneficiaires: referencesDesBeneficiaires,
            lieux: { mediateque },
          }),
          semerLesCoordinations: semerLesCoordinationsDeDemonstration,
        }),
      {
        onError: {
          CompteNonFixture: 'Seul un utilisateur de test se réinitialise',
        },
      },
    ),
  )
