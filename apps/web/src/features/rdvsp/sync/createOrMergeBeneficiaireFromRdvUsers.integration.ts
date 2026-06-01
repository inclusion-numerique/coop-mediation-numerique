import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { communeFieldsFromRdvAddress } from './communeFieldsFromRdvAddress'
import {
  createOrMergeBeneficiaireFromRdvUser,
  type RdvUserForMerge,
} from './createOrMergeBeneficiaireFromRdvUsers'

jest.mock('./communeFieldsFromRdvAddress', () => ({
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

const rdvUserId = 990_101

const baseRdvUser: RdvUserForMerge = {
  id: rdvUserId,
  firstName: 'Sylvie',
  lastName: 'Pitre-Test',
  email: null,
  phoneNumber: null,
  address: '12 rue de la Paix, 27000 Évreux',
  birthDate: null,
  beneficiaire: null,
}

const createdBeneficiaireIds: string[] = []

const trackBeneficiaire = (id: string) => {
  createdBeneficiaireIds.push(id)
  return id
}

describe('createOrMergeBeneficiaireFromRdvUser commune geocoding', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
  }, 100_000)

  beforeEach(() => {
    mockedCommuneFields.mockReset()
  })

  afterEach(async () => {
    await prismaClient.beneficiaire.deleteMany({
      where: { id: { in: createdBeneficiaireIds } },
    })
    createdBeneficiaireIds.length = 0
    await prismaClient.rdvUser.deleteMany({ where: { id: rdvUserId } })
  })

  test('fills the commune trio when creating a beneficiaire from a rdv user', async () => {
    mockedCommuneFields.mockResolvedValue(evreux)
    await prismaClient.rdvUser.create({
      data: {
        id: rdvUserId,
        firstName: baseRdvUser.firstName,
        lastName: baseRdvUser.lastName,
        notifyByEmail: false,
        notifyBySms: false,
      },
    })

    const created = await createOrMergeBeneficiaireFromRdvUser({
      rdvUser: baseRdvUser,
      mediateurId: mediateurAvecActiviteMediateurId,
    })
    trackBeneficiaire(created.id)

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: created.id },
    })

    expect(mockedCommuneFields).toHaveBeenCalledWith(baseRdvUser.address)
    expect(beneficiaire.commune).toBe('Évreux')
    expect(beneficiaire.communeCodePostal).toBe('27000')
    expect(beneficiaire.communeCodeInsee).toBe('27229')
  })

  test('fills the commune trio when merging into a beneficiaire without commune', async () => {
    mockedCommuneFields.mockResolvedValue(evreux)
    const beneficiaireId = trackBeneficiaire(v4())
    await prismaClient.beneficiaire.create({
      data: {
        id: beneficiaireId,
        mediateurId: mediateurAvecActiviteMediateurId,
        anonyme: false,
        prenom: 'Sylvie',
        nom: 'Pitre-Test',
        commune: null,
        communeCodePostal: null,
        communeCodeInsee: null,
      },
    })

    await createOrMergeBeneficiaireFromRdvUser({
      rdvUser: {
        ...baseRdvUser,
        beneficiaire: {
          id: beneficiaireId,
          prenom: 'Sylvie',
          nom: 'Pitre-Test',
          email: null,
          telephone: null,
          mediateurId: mediateurAvecActiviteMediateurId,
          adresse: null,
          anneeNaissance: null,
          commune: null,
        },
      },
      mediateurId: mediateurAvecActiviteMediateurId,
    })

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: beneficiaireId },
    })

    expect(beneficiaire.commune).toBe('Évreux')
    expect(beneficiaire.communeCodePostal).toBe('27000')
    expect(beneficiaire.communeCodeInsee).toBe('27229')
  })

  test('never overwrites an existing commune (and skips geocoding)', async () => {
    mockedCommuneFields.mockResolvedValue(evreux)
    const beneficiaireId = trackBeneficiaire(v4())
    await prismaClient.beneficiaire.create({
      data: {
        id: beneficiaireId,
        mediateurId: mediateurAvecActiviteMediateurId,
        anonyme: false,
        prenom: 'Sylvie',
        nom: 'Pitre-Test',
        commune: 'Paris',
        communeCodePostal: '75001',
        communeCodeInsee: '75101',
      },
    })

    await createOrMergeBeneficiaireFromRdvUser({
      rdvUser: {
        ...baseRdvUser,
        beneficiaire: {
          id: beneficiaireId,
          prenom: 'Sylvie',
          nom: 'Pitre-Test',
          email: null,
          telephone: null,
          mediateurId: mediateurAvecActiviteMediateurId,
          adresse: null,
          anneeNaissance: null,
          commune: 'Paris',
        },
      },
      mediateurId: mediateurAvecActiviteMediateurId,
    })

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: beneficiaireId },
    })

    expect(beneficiaire.commune).toBe('Paris')
    expect(beneficiaire.communeCodePostal).toBe('75001')
    expect(mockedCommuneFields).not.toHaveBeenCalled()
  })
})
