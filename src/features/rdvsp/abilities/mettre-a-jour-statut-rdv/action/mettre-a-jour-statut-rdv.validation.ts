import { z } from 'zod'
import { RdvId } from '../../../domain/identifiants/rdv-id'
import { StatutPresenceModifiable } from '../../../domain/rdv/statut-presence'

export const MettreAJourStatutRdvValidation = z.object({
  rdvId: RdvId.schema,
  statut: StatutPresenceModifiable.schema,
})
