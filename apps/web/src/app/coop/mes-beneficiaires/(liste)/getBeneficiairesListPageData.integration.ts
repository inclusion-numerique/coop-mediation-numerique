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
import { getBeneficiairesListPageData } from '@app/web/app/coop/mes-beneficiaires/(liste)/getBeneficiairesListPageData'
import {
  beneficiaireMaximaleConseillerNumerique,
  beneficiaireMinimaleConseillerNumerique,
  beneficiaireSansAccompagnementsConseillerNumerique,
} from '@app/fixtures/beneficiaires'

describe('getBeneficiairesListPageData', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
    await resetFixtureUser(mediateurSansActivites, false)
    await resetFixtureUser(conseillerNumerique, false)
  })

  describe('mediateur sans activites', () => {
    test('should give empty data', async () => {
      const data = await getBeneficiairesListPageData({
        mediateurId: mediateurSansActivitesMediateurId,
        searchParams: {},
      })
      expect(data).toEqual({
        mediateurId: mediateurSansActivitesMediateurId,
        searchParams: {},
        searchResult: {
          beneficiaires: [],
          matchesCount: 0,
          moreResults: 0,
          totalPages: 0,
        },
      })
    })
  })

  describe('conseiller numérique', () => {
    test('should give list of own beneficiaires', async () => {
      const data = await getBeneficiairesListPageData({
        mediateurId: conseillerNumeriqueMediateurId,
        searchParams: {},
      })

      // Should not include the beneficiaire anonyme
      expect(data).toEqual({
        mediateurId: conseillerNumeriqueMediateurId,
        searchParams: {},
        searchResult: {
          beneficiaires: [
            expect.objectContaining({
              id: beneficiaireMaximaleConseillerNumerique.id,
            }),
            expect.objectContaining({
              id: beneficiaireMinimaleConseillerNumerique.id,
            }),
            expect.objectContaining({
              id: beneficiaireSansAccompagnementsConseillerNumerique.id,
            }),
          ],
          matchesCount: 3,
          moreResults: 0,
          totalPages: 1,
        },
      })
    })
  })
})
