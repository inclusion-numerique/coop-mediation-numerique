import { getAccompagnementsCountByMonth } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getAccompagnementsCountByPeriod'
import { getTotalCountsStats } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getTotalCountsStats'
import { prismaClient } from '@app/web/prismaClient'
import type { UserProfile } from '@app/web/utils/user'
import { searchActivite } from './searchActivite'

/**
 * Régression #1799 : « mediateurs_coordonnes » garde une ligne par passage dans l'équipe.
 * Un médiateur ré-invité en avait donc deux, et la jointure d'appartenance comptait ses
 * accompagnements deux fois dans « Mes statistiques » — sans que rien ne bouge dans l'export.
 */

const coordinateurUserId = '9f1c0a3e-0000-4000-8000-000000000001'
const reinviteUserId = '9f1c0a3e-0000-4000-8000-000000000002'
const ancienUserId = '9f1c0a3e-0000-4000-8000-000000000003'
const coordinateurId = '9f1c0a3e-0000-4000-8000-000000000011'
const reinviteMediateurId = '9f1c0a3e-0000-4000-8000-000000000012'
const ancienMediateurId = '9f1c0a3e-0000-4000-8000-000000000013'
const activiteCollectiveId = '9f1c0a3e-0000-4000-8000-000000000021'
const activiteDansEquipeId = '9f1c0a3e-0000-4000-8000-000000000022'
const activiteHorsEquipeId = '9f1c0a3e-0000-4000-8000-000000000023'
const beneficiaireIds = [
  '9f1c0a3e-0000-4000-8000-000000000031',
  '9f1c0a3e-0000-4000-8000-000000000032',
  '9f1c0a3e-0000-4000-8000-000000000033',
  '9f1c0a3e-0000-4000-8000-000000000034',
]

const sortieDeLancienMembre = new Date('2026-05-06')

const mediateurIds = [reinviteMediateurId, ancienMediateurId]

const user = {
  coordinateur: {
    id: coordinateurId,
    mediateursCoordonnes: [{ mediateurId: reinviteMediateurId }],
    ancienMediateursCoordonnes: [{ mediateurId: ancienMediateurId }],
  },
} satisfies UserProfile

const activitesFilters = { du: '2026-01-01', au: '2026-12-31' }

const seedUser = (id: string, email: string) =>
  prismaClient.user.create({ data: { id, email, name: email } })

const seedActivite = ({
  id,
  mediateurId,
  date,
  beneficiaires,
}: {
  id: string
  mediateurId: string
  date: Date
  beneficiaires: string[]
}) =>
  prismaClient.activite.create({
    data: {
      id,
      mediateurId,
      date,
      duree: 60,
      type: beneficiaires.length > 1 ? 'Collectif' : 'Individuel',
      typeLieu: 'Autre',
      accompagnementsCount: beneficiaires.length,
      accompagnements: {
        createMany: {
          data: beneficiaires.map((beneficiaireId) => ({ beneficiaireId })),
        },
      },
    },
  })

describe("activités d'une équipe coordonnée", () => {
  beforeAll(async () => {
    await seedUser(coordinateurUserId, 'coordinateur-1799@example.com')
    await seedUser(reinviteUserId, 'reinvite-1799@example.com')
    await seedUser(ancienUserId, 'ancien-1799@example.com')

    await prismaClient.coordinateur.create({
      data: { id: coordinateurId, userId: coordinateurUserId },
    })
    await prismaClient.mediateur.createMany({
      data: [
        { id: reinviteMediateurId, userId: reinviteUserId },
        { id: ancienMediateurId, userId: ancienUserId },
      ],
    })

    await prismaClient.mediateurCoordonne.createMany({
      data: [
        // Le médiateur ré-invité : une appartenance close, puis une nouvelle.
        {
          coordinateurId,
          mediateurId: reinviteMediateurId,
          creation: new Date('2025-09-01'),
          suppression: new Date('2026-03-24'),
        },
        {
          coordinateurId,
          mediateurId: reinviteMediateurId,
          creation: new Date('2026-04-08'),
        },
        // L'ancien membre : une seule appartenance, close.
        {
          coordinateurId,
          mediateurId: ancienMediateurId,
          creation: new Date('2025-09-01'),
          suppression: sortieDeLancienMembre,
        },
      ],
    })

    await prismaClient.beneficiaire.createMany({
      data: beneficiaireIds.map((id, index) => ({
        id,
        anonyme: true,
        mediateurId: index === 3 ? ancienMediateurId : reinviteMediateurId,
      })),
    })

    await seedActivite({
      id: activiteCollectiveId,
      mediateurId: reinviteMediateurId,
      date: new Date('2026-01-15'),
      beneficiaires: beneficiaireIds.slice(0, 3),
    })
    await seedActivite({
      id: activiteDansEquipeId,
      mediateurId: ancienMediateurId,
      date: new Date('2026-01-20'),
      beneficiaires: [beneficiaireIds[3]],
    })
    await seedActivite({
      id: activiteHorsEquipeId,
      mediateurId: ancienMediateurId,
      date: new Date('2026-06-10'),
      beneficiaires: [beneficiaireIds[3]],
    })
  }, 100_000)

  afterAll(async () => {
    await prismaClient.accompagnement.deleteMany({
      where: {
        activiteId: {
          in: [
            activiteCollectiveId,
            activiteDansEquipeId,
            activiteHorsEquipeId,
          ],
        },
      },
    })
    await prismaClient.activite.deleteMany({
      where: {
        id: {
          in: [
            activiteCollectiveId,
            activiteDansEquipeId,
            activiteHorsEquipeId,
          ],
        },
      },
    })
    await prismaClient.beneficiaire.deleteMany({
      where: { id: { in: beneficiaireIds } },
    })
    await prismaClient.mediateurCoordonne.deleteMany({
      where: { coordinateurId },
    })
    await prismaClient.mediateur.deleteMany({
      where: { id: { in: mediateurIds } },
    })
    await prismaClient.coordinateur.deleteMany({
      where: { id: coordinateurId },
    })
    await prismaClient.user.deleteMany({
      where: { id: { in: [coordinateurUserId, reinviteUserId, ancienUserId] } },
    })
  })

  it("ne compte qu'une fois les accompagnements d'un médiateur ré-invité", async () => {
    const totalCounts = await getTotalCountsStats({
      user,
      mediateurIds,
      activitesFilters,
    })

    expect(totalCounts.activites.total).toBe(2)
    expect(totalCounts.accompagnements.total).toBe(4)
    expect(totalCounts.beneficiaires.total).toBe(4)
  })

  it("ne compte qu'une fois les accompagnements du mois", async () => {
    const parMois = await getAccompagnementsCountByMonth({
      user,
      mediateurIds,
      activitesFilters,
      periodStart: '2026-01-01',
      periodEnd: '2026-12-31',
    })

    expect(parMois).toContainEqual({ label: '01/26', count: 4 })
    expect(parMois).toContainEqual({ label: '06/26', count: 0 })
  })

  it("expose à la liste d'activités le même périmètre qu'aux statistiques", async () => {
    const { activitesMatchesCount, accompagnementsMatchesCount } =
      await searchActivite({
        mediateurIds,
        coordinateurId,
        searchParams: { lignes: '1000', ...activitesFilters },
      })

    expect(activitesMatchesCount).toBe(2)
    expect(accompagnementsMatchesCount).toBe(4)
  })
})
