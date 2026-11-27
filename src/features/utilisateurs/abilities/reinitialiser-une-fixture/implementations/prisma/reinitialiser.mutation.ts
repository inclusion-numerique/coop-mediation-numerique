import {
  type NomAffiche,
  nomAffiche,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import {
  type DonneesDeDemonstration,
  reinitialiserUnUtilisateur,
} from '@/features/utilisateurs/fixtures/reinitialiser-un-utilisateur'
import { identiteToDomain } from '@/features/utilisateurs/implementations/prisma/identite.transfer'

export const reinitialiser = async (
  utilisateurId: UtilisateurId,
  demonstration: DonneesDeDemonstration,
): Promise<NomAffiche> =>
  nomAffiche(
    identiteToDomain(
      await reinitialiserUnUtilisateur({ id: utilisateurId }, demonstration),
    ),
  )
