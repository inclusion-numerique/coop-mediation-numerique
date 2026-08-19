import { output } from '@app/fixtures/output'
import type { Prisma } from '@prisma/client'

/**
 * Upsert des utilisateurs de fixtures, tolérant aux comptes déjà présents.
 *
 * Sur une base vierge (CI, docker local), un upsert par `id` suffit. Sur une base restaurée depuis
 * la prod (`cli backup:locally-restore-latest-main`), l'email d'une fixture appartient souvent déjà
 * à un compte réel portant un AUTRE `id` : l'unicité de `email` fait alors échouer l'upsert (P2002).
 *
 * On réutilise donc l'`id` du compte existant au lieu d'en imposer un nouveau — sans jamais
 * réécrire cet `id`, qui est référencé par toutes les données réelles du compte.
 *
 * Exception : une fixture qui rattache un médiateur ou un coordinateur ne peut pas être greffée sur
 * un compte existant (`mediateurs.user_id` et `coordinateurs.user_id` sont uniques, et le compte
 * réel a déjà les siens, avec ses emplois et ses activités). Ces fixtures-là sont ignorées, avec
 * une trace : le compte réel, plus riche, reste intact.
 */
export type UserFixture = Prisma.UserCreateInput & { id: string; email: string }

const RELATIONS_UNIQUES = ['mediateur', 'coordinateur'] as const

const relationsRattachees = (user: UserFixture) =>
  RELATIONS_UNIQUES.filter((relation) => user[relation] != null)

const idsExistantsParEmail = async (
  transaction: Prisma.TransactionClient,
  fixtures: UserFixture[],
) => {
  const existants = await transaction.user.findMany({
    where: { email: { in: fixtures.map(({ email }) => email) } },
    select: { id: true, email: true },
  })

  return new Map(existants.map(({ email, id }) => [email, id]))
}

const upsertUserFixture =
  (transaction: Prisma.TransactionClient, libelle: string) =>
  (user: UserFixture, idExistant?: string) => {
    if (idExistant === undefined || idExistant === user.id) {
      return transaction.user
        .upsert({ where: { id: user.id }, create: user, update: user })
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

    const { id: _idDeFixture, ...sansId } = user

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

export const upsertUserFixtures =
  (transaction: Prisma.TransactionClient) =>
  async (libelle: string, fixtures: UserFixture[]) => {
    const idsExistants = await idsExistantsParEmail(transaction, fixtures)

    await Promise.all(
      fixtures.map((user) =>
        upsertUserFixture(transaction, libelle)(
          user,
          idsExistants.get(user.email),
        ),
      ),
    )
  }
