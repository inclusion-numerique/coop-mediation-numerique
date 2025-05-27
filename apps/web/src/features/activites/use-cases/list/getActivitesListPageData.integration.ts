import { fixturesActivitesConseillerNumerique } from '@app/fixtures/activites'
import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
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
import { groupActivitesByDate } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { prismaClient } from '@app/web/prismaClient'
import { getActivitesListPageData } from './getActivitesListPageData'

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
        user: {
          ...mediateurSansActivites,
          rdvAccount: null,
        },
      })
      expect(data).toEqual({
        mediateurId: mediateurSansActivitesMediateurId,
        searchParams: {},
        isFiltered: false,
        searchResult: {
          activites: [],
          matchesCount: 0,
          moreResults: 0,
          totalPages: 0,
          page: 1,
          pageSize: 50,
        },
        activiteDates: {
          first: undefined,
          last: undefined,
        },
        activitesByDate: [],
        user: {
          ...mediateurSansActivites,
          rdvAccount: null,
        },
      })
    })
  })

  describe('conseiller numérique', () => {
    test('should give list of own activites', async () => {
      const data = await getActivitesListPageData({
        mediateurId: conseillerNumeriqueMediateurId,
        searchParams: {},
        user: {
          ...conseillerNumerique,
          rdvAccount: null,
        },
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
        isFiltered: false,
        searchResult: {
          activites: sortedActivites.map((fixture) =>
            expect.objectContaining({
              id: fixture.activite.id,
            }),
          ),
          matchesCount: 10,
          moreResults: 0,
          totalPages: 1,
          page: 1,
          pageSize: 50,
        },
        activiteDates: {
          first: sortedActivites.at(-1)?.activite.date,
          last: sortedActivites.at(0)?.activite.date,
        },
        activitesByDate: expect.toBeArray(),
        user: {
          ...conseillerNumerique,
          rdvAccount: null,
        },
      })
    })
  })
})
