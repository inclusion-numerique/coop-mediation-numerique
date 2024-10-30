import { seedStructures } from '@app/fixtures/structures'
import {
  conseillerNumerique,
  conseillerNumeriqueMediateurId,
} from '@app/fixtures/users/conseillerNumerique'
import { mediateurAvecActivite } from '@app/fixtures/users/mediateurAvecActivite'
import {
  mediateurSansActivites,
  mediateurSansActivitesMediateurId,
} from '@app/fixtures/users/mediateurSansActivites'
import { prismaClient } from '@app/web/prismaClient'
import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { getActivitesListPageData } from '@app/web/app/coop/mes-activites/(liste)/getActivitesListPageData'
import { fixturesActivitesConseillerNumerique } from '@app/fixtures/activites'

describe('getActivitesListPageData', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
    await resetFixtureUser(mediateurSansActivites, false)
    await resetFixtureUser(conseillerNumerique, false)
  })

  describe('mediateur sans activites', () => {
    test('should give empty data', async () => {
      const data = await getActivitesListPageData({
        mediateurId: mediateurSansActivitesMediateurId,
        searchParams: {},
      })
      expect(data).toEqual({
        mediateurId: mediateurSansActivitesMediateurId,
        searchParams: {},
        searchResult: {
          activites: [],
          matchesCount: 0,
          moreResults: 0,
          totalPages: 0,
        },
        activiteDates: {
          first: undefined,
          last: undefined,
        },
      })
    })
  })

  describe('conseiller numérique', () => {
    test('should give list of own activites', async () => {
      const data = await getActivitesListPageData({
        mediateurId: conseillerNumeriqueMediateurId,
        searchParams: {},
      })

      const sortedActivites = fixturesActivitesConseillerNumerique.sort(
        (a, b) => {
          const dateA = a.activite.date.getTime()
          const dateB = b.activite.date.getTime()
          if (dateA === dateB) {
            return b.activite.creation.getTime() - a.activite.creation.getTime()
          }
          return dateB - dateA
        },
      )

      expect(data).toEqual({
        mediateurId: conseillerNumeriqueMediateurId,
        searchParams: {},
        searchResult: {
          activites: sortedActivites.map((fixture) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            expect.objectContaining({
              id: fixture.activite.id,
            }),
          ),
          matchesCount: 10,
          moreResults: 0,
          totalPages: 1,
        },
        activiteDates: {
          first: sortedActivites.at(-1)?.activite.date,
          last: sortedActivites.at(0)?.activite.date,
        },
      })
    })
  })
})
