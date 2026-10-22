import { addMutationLog } from '@app/web/utils/addMutationLog'
import type { CompteSupprime } from '../../domain'

export const logEffacementReport = (compte: CompteSupprime): void => {
  addMutationLog({
    userId: compte.id,
    nom: 'SupprimerCompte',
    duration: 0,
    data: {
      motif: compte.motif,
      supprimeLe: compte.supprimeLe.toISOString(),
      report: compte.report._tag,
      results: compte.report.results.map((result) =>
        result._tag === 'erased'
          ? {
              step: result.step,
              state: 'erased',
              count: result.count,
            }
          : result._tag === 'skipped'
            ? { step: result.step, state: 'skipped' }
            : {
                step: result.step,
                state: 'failed',
                cause: result.cause,
              },
      ),
    },
  })
}
