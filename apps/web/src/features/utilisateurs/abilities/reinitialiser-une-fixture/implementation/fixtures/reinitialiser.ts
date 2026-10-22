import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { fixtureUsers } from '@app/fixtures/users'
import { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

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

export const reinitialiser = async (utilisateurId: string): Promise<string> => {
  const compte = await resetFixtureUser({ id: utilisateurId })
  return compte.name ?? compte.email
}
