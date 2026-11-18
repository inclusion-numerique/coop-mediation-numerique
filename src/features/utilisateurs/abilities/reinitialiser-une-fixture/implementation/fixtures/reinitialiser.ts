import { prismaClient } from '@/configuration/prisma/prismaClient'
import { identiteToDomain } from '@/features/utilisateurs/db/identite.transfer'
import {
  type NomAffiche,
  nomAffiche,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { resetFixtureUser } from '@/features/utilisateurs/fixtures/resetFixtureUser'
import { fixtureUsers } from '@/features/utilisateurs/fixtures/users'

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
): Promise<NomAffiche> =>
  nomAffiche(identiteToDomain(await resetFixtureUser({ id: utilisateurId })))
