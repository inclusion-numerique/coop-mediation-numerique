import { prismaClient } from '@/configuration/prisma/prismaClient'
import {
  type NomAffiche,
  nomAffiche,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import {
  type DonneesDeDemonstration,
  resetFixtureUser,
} from '@/features/utilisateurs/fixtures/resetFixtureUser'
import { fixtureUsers } from '@/features/utilisateurs/fixtures/users'
import { identiteToDomain } from '@/features/utilisateurs/implementations/prisma/identite.transfer'

const estDansLesFixtures = (id: string): boolean =>
  fixtureUsers.some((fixture) => fixture.id === id)

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
      await resetFixtureUser({ id: utilisateurId }, demonstration),
    ),
  )
