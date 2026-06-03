import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { communeFieldsFromRdvAddress } from '@app/web/features/rdvsp/sync/communeFieldsFromRdvAddress'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { executeBackfillCommuneRdvsp } from './executeBackfillCommuneRdvsp'

jest.mock('@app/web/features/rdvsp/sync/communeFieldsFromRdvAddress', () => ({
  communeFieldsFromRdvAddress: jest.fn(),
}))

const mockedCommuneFields = communeFieldsFromRdvAddress as jest.MockedFunction<
  typeof communeFieldsFromRdvAddress
>

const evreux = {
  commune: 'Évreux',
  communeCodePostal: '27000',
  communeCodeInsee: '27229',
}

const rdvLinkedNoCommuneId = v4()
const rdvLinkedWithCommuneId = v4()
const rdvLinkedNoAddressId = v4()
const notRdvLinkedId = v4()

const beneficiaireIds = [
  rdvLinkedNoCommuneId,
  rdvLinkedWithCommuneId,
  rdvLinkedNoAddressId,
  notRdvLinkedId,
]
const rdvUserIds = [970_001, 970_002, 970_003]

describe('executeBackfillCommuneRdvsp', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
  }, 100_000)

  afterEach(async () => {
    await prismaClient.beneficiaire.deleteMany({
      where: { id: { in: beneficiaireIds } },
    })
    await prismaClient.rdvUser.deleteMany({ where: { id: { in: rdvUserIds } } })
  })

  test('fills commune only for rdv-linked fiches that have an address and no commune', async () => {
    mockedCommuneFields.mockImplementation(async (address) =>
      address === '12 rue de la Paix, 27000 Évreux' ? evreux : null,
    )

    await prismaClient.rdvUser.createMany({
      data: rdvUserIds.map((id) => ({
        id,
        firstName: 'Rdv',
        lastName: `User ${id}`,
        notifyByEmail: false,
        notifyBySms: false,
      })),
    })

    await prismaClient.beneficiaire.createMany({
      data: [
        {
          id: rdvLinkedNoCommuneId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          rdvUserId: 970_001,
          adresse: '12 rue de la Paix, 27000 Évreux',
          commune: null,
        },
        {
          id: rdvLinkedWithCommuneId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          rdvUserId: 970_002,
          adresse: '5 avenue ailleurs',
          commune: 'Paris',
          communeCodePostal: '75001',
          communeCodeInsee: '75101',
        },
        {
          id: rdvLinkedNoAddressId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          rdvUserId: 970_003,
          adresse: null,
          commune: null,
        },
        {
          id: notRdvLinkedId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          rdvUserId: null,
          adresse: '8 rue sans rdv',
          commune: null,
        },
      ],
    })

    const result = await executeBackfillCommuneRdvsp({
      name: 'backfill-commune-rdvsp',
      payload: {},
    })

    const [noCommune, withCommune, noAddress, notRdv] = await Promise.all(
      beneficiaireIds.map((id) =>
        prismaClient.beneficiaire.findUniqueOrThrow({ where: { id } }),
      ),
    )

    expect(noCommune.commune).toBe('Évreux')
    expect(noCommune.communeCodePostal).toBe('27000')
    expect(noCommune.communeCodeInsee).toBe('27229')
    expect(withCommune.commune).toBe('Paris')
    expect(noAddress.commune).toBeNull()
    expect(notRdv.commune).toBeNull()
    expect(mockedCommuneFields).toHaveBeenCalledWith(
      '12 rue de la Paix, 27000 Évreux',
    )
    expect(mockedCommuneFields).not.toHaveBeenCalledWith('5 avenue ailleurs')
    expect(mockedCommuneFields).not.toHaveBeenCalledWith('8 rue sans rdv')
    expect(result.updated).toBeGreaterThanOrEqual(1)
  })
})
