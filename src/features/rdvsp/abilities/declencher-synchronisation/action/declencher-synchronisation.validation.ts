import { z } from 'zod'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'

export const DeclencherSynchronisationValidation = z.object({
  utilisateurId: UtilisateurCoopId.schema,
})
