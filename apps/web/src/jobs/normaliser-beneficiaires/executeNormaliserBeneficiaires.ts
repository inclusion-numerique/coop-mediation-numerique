import { normaliserBeneficiaires } from '@app/web/features/beneficiaire/abilities/normaliser-beneficiaires/implementation'
import { output } from '@app/web/jobs/output'
import type { NormaliserBeneficiairesJob } from './normaliserBeneficiairesJob'

// Déclencheur mince : l'opération vit dans l'ability de la feature.
export const executeNormaliserBeneficiaires = async (
  _job: NormaliserBeneficiairesJob,
) => {
  const result = await normaliserBeneficiaires()

  output.log(
    `normaliser-beneficiaires: updated ${result.updated}, skipped ${result.skipped} invalid`,
  )

  return result
}
