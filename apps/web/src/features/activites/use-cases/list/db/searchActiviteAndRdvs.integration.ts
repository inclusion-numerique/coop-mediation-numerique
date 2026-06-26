import {
  mediateurAvecActiviteCrasCollectifs,
  mediateurAvecActiviteCrasDemarchesAdministratives,
  mediateurAvecActiviteCrasIndividuels,
} from '@app/fixtures/activites'
import {
  beneficiaireMaximaleMediateurAvecActivite,
  beneficiaireSansAccompagnementsMediateurAvecActivite,
} from '@app/fixtures/beneficiaires'
import { refreshFixturesComputedFields } from '@app/fixtures/refreshFixturesComputedFields'
import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import { conseillerNumerique } from '@app/fixtures/users/conseillerNumerique'
import { mediateurAvecActivite } from '@app/fixtures/users/mediateurAvecActivite'
import { mediateurSansActivites } from '@app/fixtures/users/mediateurSansActivites'
import { prismaClient } from '@app/web/prismaClient'
import { searchActiviteAndRdvs } from './searchActiviteAndRdvs'

// Recherche scopée à un bénéficiaire (telle qu'invoquée par la page
// d'accompagnements) : les activités ne sont pas paginées (lignes élevé) et sont
// rendues dans l'ordre attendu.
const searchAccompagnements = (beneficiaire: {
  id: string
  mediateurId: string
}) =>
  searchActiviteAndRdvs({
    mediateurIds: [beneficiaire.mediateurId],
    beneficiaireIds: [beneficiaire.id],
    rdvUserIds: [],
    rdvAccountIds: [],
    shouldFetchRdvs: false,
    shouldFetchActivites: true,
    searchParams: { lignes: '10000' },
  })

describe('searchActiviteAndRdvs scoped to a beneficiaire', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
    await resetFixtureUser(mediateurSansActivites, false)
    await resetFixtureUser(conseillerNumerique, false)
    await refreshFixturesComputedFields()
  }, 100_000)

  it('returns no activites for beneficiaire with no data', async () => {
    expect(
      await searchAccompagnements(
        beneficiaireSansAccompagnementsMediateurAvecActivite,
      ),
    ).toEqual({
      items: [],
      accompagnementsMatchesCount: 0,
      activitesMatchesCount: 0,
      matchesCount: 0,
      rdvMatchesCount: 0,
      moreResults: 0,
      page: 1,
      pageSize: 10000,
      totalPages: 0,
    })
  })

  it('returns activites ordered by date for beneficiaire with cras', async () => {
    const expectedActivites = [
      // Collective CRA on 2024-08-04 (creation: 08:00:00)
      expect.objectContaining({
        id: mediateurAvecActiviteCrasCollectifs[0].activite.id,
      }),

      // Demarche Admin on 2024-08-03 (creation: 16:00:00)
      expect.objectContaining({
        id: mediateurAvecActiviteCrasDemarchesAdministratives[3].activite.id,
      }),
      // Demarche Admin on 2024-08-03 (creation: 15:00:00)
      expect.objectContaining({
        id: mediateurAvecActiviteCrasDemarchesAdministratives[1].activite.id,
      }),
      // Individuel CRA on 2024-07-28 (creation: 10:00:00)
      expect.objectContaining({
        id: mediateurAvecActiviteCrasIndividuels[2].activite.id,
      }),
      // Individuel CRA on 2024-07-28 (creation: 09:00:00)
      expect.objectContaining({
        id: mediateurAvecActiviteCrasIndividuels[3].activite.id,
      }),
      // Collective CRA on 2024-07-05 (creation: 09:00:00)
      expect.objectContaining({
        id: mediateurAvecActiviteCrasCollectifs[1].activite.id,
      }),
    ]

    expect(
      await searchAccompagnements(beneficiaireMaximaleMediateurAvecActivite),
    ).toEqual({
      items: expectedActivites,
      accompagnementsMatchesCount: 18,
      activitesMatchesCount: 6,
      matchesCount: 6,
      rdvMatchesCount: 0,
      moreResults: 0,
      page: 1,
      pageSize: 10000,
      totalPages: 1,
    })
  })
})
