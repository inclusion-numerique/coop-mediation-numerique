import { normaliserTelephones } from '@app/web/features/beneficiaire/abilities/normaliser-telephones/implementation'
import { output } from '@app/web/jobs/output'
import type { BackfillTelephonesBeneficiairesJob } from './backfillTelephonesBeneficiairesJob'

// Déclencheur mince : l'opération vit dans l'ability de la feature.
export const executeBackfillTelephonesBeneficiaires = async (
  _job: BackfillTelephonesBeneficiairesJob,
) => {
  const result = await normaliserTelephones()

  output.log(
    `backfill-telephones-beneficiaires: normalized ${result.updated}, skipped ${result.skipped} invalid`,
  )

  return result
}
