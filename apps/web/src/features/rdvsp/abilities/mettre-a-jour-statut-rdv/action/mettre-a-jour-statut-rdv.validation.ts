import { z } from 'zod'
import { RdvId } from '../../../domain/rdv-id'
import { StatutPresenceModifiable } from '../../../domain/statut-presence'

/**
 * Le contrat traversant le réseau. Les deux champs sont validés par les value
 * objects du domaine plutôt que par des primitives recopiées : la liste des
 * statuts qu'un agent peut poser n'a qu'une définition, et `unknown` en est
 * exclu ici comme partout.
 */
export const MettreAJourStatutRdvValidation = z.object({
  rdvId: RdvId.schema,
  statut: StatutPresenceModifiable.schema,
})
