import { addMutationLog } from '@app/web/utils/addMutationLog'
import type { CompteSupprime } from '../../domain'

/**
 * Trace de l'effacement dans le journal d'audit.
 *
 * Le constat y va en `data` sans aucune donnée personnelle — noms de charges et
 * volumes seulement, conformément à la règle du journal. C'est un événement
 * daté et non un état du compte, d'où le journal plutôt qu'une colonne : et
 * c'est lui que relira la reprise des effacements laissés incomplets.
 */
export const journaliserConstat = (compte: CompteSupprime): void => {
  addMutationLog({
    userId: compte.id,
    nom: 'SupprimerCompte',
    duration: 0,
    data: {
      motif: compte.motif,
      supprimeLe: compte.supprimeLe.toISOString(),
      constat: compte.constat._tag,
      resultats: compte.constat.resultats.map((resultat) =>
        resultat._tag === 'effacee'
          ? {
              charge: resultat.charge,
              etat: 'effacee',
              volume: resultat.volume,
            }
          : resultat._tag === 'sansObjet'
            ? { charge: resultat.charge, etat: 'sansObjet' }
            : {
                charge: resultat.charge,
                etat: 'echouee',
                cause: resultat.cause,
              },
      ),
    },
  })
}
