import { z } from 'zod'
import { BeneficiaireCibleId } from '../domain/beneficiaire-cible'

/**
 * L'ancienne procédure recevait aussi une `returnUrl` du client, qu'elle
 * écartait : les deux liens transmis à RDV Service Public ont toujours pointé
 * vers le dossier d'accompagnement, calculé côté serveur. Le champ disparaît
 * plutôt que de laisser croire qu'il agit.
 */
export const PrendreRendezVousValidation = z.object({
  beneficiaireId: BeneficiaireCibleId.schema,
})
