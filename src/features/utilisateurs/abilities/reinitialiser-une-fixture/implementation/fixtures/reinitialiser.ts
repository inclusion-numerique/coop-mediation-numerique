import { identiteToDomain } from '@app/web/features/utilisateurs/db/identite.transfer'
import {
  type NomAffiche,
  nomAffiche,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { resetFixtureUser } from '@app/web/fixtures/resetFixtureUser'
import { fixtureUsers } from '@app/web/fixtures/users'
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

export const reinitialiser = async (
  utilisateurId: string,
): Promise<NomAffiche> =>
  nomAffiche(identiteToDomain(await resetFixtureUser({ id: utilisateurId })))
