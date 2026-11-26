import { failure, success } from '@/libraries/result'
import { RapprochementEchoue } from '../../domain/errors'
import type {
  CreerOuFusionnerDepuisUsagersExternes,
  RapprocherLesBeneficiaires,
} from '../../domain/ports'

export const rapprocherLesBeneficiaires =
  (
    creerOuFusionner: CreerOuFusionnerDepuisUsagersExternes,
  ): RapprocherLesBeneficiaires =>
  async ({ usagers, mediateurId }) =>
    creerOuFusionner({ usagers: [...usagers], mediateurId }).then(
      ({ skipped }) => success({ ecartes: skipped.length }),
      (erreur: unknown) =>
        failure(
          RapprochementEchoue(
            erreur instanceof Error ? erreur.message : String(erreur),
          ),
        ),
    )
