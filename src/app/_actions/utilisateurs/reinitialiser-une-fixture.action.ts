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
import { ReinitialiserUneFixtureValidation } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/action/reinitialiser-une-fixture.validation'
import { reinitialiserUneFixture as reinitialiserLaFixture } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/domain/reinitialiser-une-fixture'
import { estUneFixture } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/implementations/prisma/est-une-fixture.query'
import { reinitialiser } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/implementations/prisma/reinitialiser.mutation'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { mediateursDesPersonas } from '@/features/utilisateurs/fixtures/personas'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const reinitialiserUneFixture = reinitialiserLaFixture({
  estUneFixture,
  reinitialiser,
})

export const reinitialiserUneFixtureAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ReinitialiserUneFixtureValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const resultat = await reinitialiserUneFixture({
          utilisateurId: UtilisateurId.safe(input.utilisateurId),
          demonstration: {
            employeuse: { structureCoopId: structureEmployeuse.id },
            semerLesActivitesDansLesLieux:
              semerLesActivitesDuPersonaDansLesLieux(mediateursDesPersonas),
            semerLesBeneficiaires: semerLesBeneficiairesDeDemonstration(
              mediateursDesPersonas,
            ),
            semerLesCras: semerLesCrasDeDemonstration({
              mediateurs: mediateursDesPersonas,
              beneficiaires: referencesDesBeneficiaires,
              lieux: { mediateque },
            }),
            semerLesCoordinations: semerLesCoordinationsDeDemonstration,
          },
        })
        return resultat.success ? success({ nom: resultat.data.nom }) : resultat
      },
      {
        onError: {
          UtilisateurIntrouvable: 'Cet utilisateur est introuvable',
          CompteNonFixture: 'Seul un utilisateur de test se réinitialise',
        },
      },
    ),
  )
