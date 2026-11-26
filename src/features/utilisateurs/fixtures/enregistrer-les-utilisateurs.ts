import type { Prisma } from '@/generated/prisma/client'
import { enSerie, output } from '@/libraries/fixtures'

export type UtilisateurAEnregistrer = Prisma.UserCreateInput & {
  id: string
  email: string
  isConseillerNumerique?: boolean
  employeDeLaStructureEmployeuse?: boolean
}

export const sansDrapeauDispositif = ({
  isConseillerNumerique: _drapeau,
  employeDeLaStructureEmployeuse: _employe,
  ...user
}: UtilisateurAEnregistrer): Prisma.UserCreateInput & {
  id: string
  email: string
} => user

const RELATIONS_UNIQUES = ['mediateur', 'coordinateur'] as const

const relationsRattachees = (user: UtilisateurAEnregistrer) =>
  RELATIONS_UNIQUES.filter((relation) => user[relation] != null)

const idsExistantsParEmail = async (
  transaction: Prisma.TransactionClient,
  fixtures: UtilisateurAEnregistrer[],
) => {
  const existants = await transaction.user.findMany({
    where: { email: { in: fixtures.map(({ email }) => email) } },
    select: { id: true, email: true },
  })

  return new Map(existants.map(({ email, id }) => [email, id]))
}

const upsertUserFixture =
  (transaction: Prisma.TransactionClient, libelle: string) =>
  (user: UtilisateurAEnregistrer, idExistant?: string) => {
    const ligne = sansDrapeauDispositif(user)

    if (idExistant === undefined || idExistant === user.id) {
      return transaction.user
        .upsert({ where: { id: user.id }, create: ligne, update: ligne })
        .catch((error) => {
          output.error(`Error upserting ${libelle} fixture`, user)
          throw error
        })
    }

    const relations = relationsRattachees(user)

    if (relations.length > 0) {
      output.log(
        `Skipping ${libelle} fixture ${user.email} : la fixture rattache ${relations.join(' et ')}, compte réel ${idExistant} préservé`,
      )
      return Promise.resolve(null)
    }

    const { id: _idDeFixture, ...sansId } = ligne

    output.log(
      `Reusing existing account ${idExistant} for ${libelle} fixture ${user.email}`,
    )

    return transaction.user
      .update({ where: { id: idExistant }, data: sansId })
      .catch((error) => {
        output.error(`Error updating existing ${libelle} fixture`, user)
        throw error
      })
  }

export const enregistrerLesUtilisateurs =
  (transaction: Prisma.TransactionClient) =>
  async (libelle: string, fixtures: UtilisateurAEnregistrer[]) => {
    const idsExistants = await idsExistantsParEmail(transaction, fixtures)

    await enSerie(fixtures, (user) =>
      upsertUserFixture(transaction, libelle)(
        user,
        idsExistants.get(user.email),
      ),
    )
  }
