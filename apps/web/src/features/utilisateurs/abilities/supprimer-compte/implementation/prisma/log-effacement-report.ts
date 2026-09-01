import { addMutationLog } from '@app/web/utils/addMutationLog'
import type { CompteSupprime } from '../../domain'

/**
 * Trace de l'effacement dans le journal d'audit.
 *
 * Le constat y va en `data` sans aucune donnée personnelle — noms d'étapes et
 * ampleurs seulement, conformément à la règle du journal. C'est un événement
 * daté et non un état du compte, d'où le journal plutôt qu'une colonne : et
 * c'est lui que relira la reprise des effacements laissés incomplets.
 */
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
