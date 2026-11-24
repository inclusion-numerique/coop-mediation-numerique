import { prismaClient } from '@/configuration/prisma/prismaClient'
import {
  type NomAffiche,
  nomAffiche,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { personas } from '@/features/utilisateurs/fixtures/personas'
import {
  type DonneesDeDemonstration,
  reinitialiserUnUtilisateur,
} from '@/features/utilisateurs/fixtures/reinitialiser-un-utilisateur'
import { identiteToDomain } from '@/features/utilisateurs/implementations/prisma/identite.transfer'

const estDansLesFixtures = (id: string): boolean =>
  personas.some((fixture) => fixture.id === id)

export const estUneFixture = async (
  utilisateurId: string,
): Promise<boolean> => {
  const id = UtilisateurId.safe(utilisateurId)
  return (
    id !== null &&
    estDansLesFixtures(id) &&
    (await prismaClient.user.count({ where: { id, isFixture: true } })) > 0
  )
}

export const reinitialiser = async (
  utilisateurId: string,
  demonstration: DonneesDeDemonstration,
): Promise<NomAffiche> =>
  nomAffiche(
    identiteToDomain(
      await reinitialiserUnUtilisateur({ id: utilisateurId }, demonstration),
    ),
  )
