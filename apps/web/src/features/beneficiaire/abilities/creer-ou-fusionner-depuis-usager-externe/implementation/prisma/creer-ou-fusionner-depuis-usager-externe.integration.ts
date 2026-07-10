import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { communeFieldsFromAddress } from '@app/web/external-apis/ban/communeFieldsFromAddress'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import type { ExternalUserToMerge } from '../../domain/creer-ou-fusionner-depuis-usager-externe'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternes } from './creer-ou-fusionner-depuis-usager-externe.mutation'

jest.mock('@app/web/external-apis/ban/communeFieldsFromAddress', () => ({
  communeFieldsFromAddress: jest.fn(),
}))

const mockedCommuneFields = communeFieldsFromAddress as jest.MockedFunction<
  typeof communeFieldsFromAddress
>

const evreux = {
  commune: 'Évreux',
  communeCodePostal: '27000',
  communeCodeInsee: '27229',
}

const rdvUserId = 990_101
const mediateurId = mediateurAvecActiviteMediateurId

const usager: ExternalUserToMerge = {
  rdvUserId,
  nom: 'Pitre-Test',
  prenom: 'Sylvie',
  telephone: null,
  email: null,
  adresse: '12 rue de la Paix, 27000 Évreux',
  birthDate: null,
}

const createdBeneficiaireIds: string[] = []

const trackBeneficiaire = (id: string) => {
  createdBeneficiaireIds.push(id)
  return id
}

const seedRdvUser = () =>
  prismaClient.rdvUser.create({
    data: {
      id: rdvUserId,
      firstName: usager.prenom ?? 'Sylvie',
      lastName: usager.nom ?? 'Pitre-Test',
      notifyByEmail: false,
      notifyBySms: false,
    },
  })

const seedLinkedBeneficiaire = (commune: {
  commune: string | null
  communeCodePostal: string | null
  communeCodeInsee: string | null
}) => {
  const id = trackBeneficiaire(v4())
  return prismaClient.beneficiaire
    .create({
      data: {
        id,
        rdvUserId,
        mediateurId,
        anonyme: false,
        prenom: 'Sylvie',
        nom: 'Pitre-Test',
        ...commune,
      },
    })
    .then(() => id)
}

describe('creerOuFusionnerBeneficiairesDepuisUsagersExternes — géocodage commune', () => {
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

  test('renseigne la commune à la création depuis un usager RDV', async () => {
    mockedCommuneFields.mockResolvedValue(evreux)
    await seedRdvUser()

    const { merges } = await creerOuFusionnerBeneficiairesDepuisUsagersExternes(
      {
        usagers: [usager],
        mediateurId,
      },
    )
    trackBeneficiaire(merges[0].id)

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: merges[0].id },
    })

    expect(mockedCommuneFields).toHaveBeenCalledWith(usager.adresse)
    expect(beneficiaire.commune).toBe('Évreux')
    expect(beneficiaire.communeCodePostal).toBe('27000')
    expect(beneficiaire.communeCodeInsee).toBe('27229')
  })

  test('renseigne la commune en fusionnant dans une fiche liée sans commune', async () => {
    mockedCommuneFields.mockResolvedValue(evreux)
    await seedRdvUser()
    const beneficiaireId = await seedLinkedBeneficiaire({
      commune: null,
      communeCodePostal: null,
      communeCodeInsee: null,
    })

    await creerOuFusionnerBeneficiairesDepuisUsagersExternes({
      usagers: [usager],
      mediateurId,
    })

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: beneficiaireId },
    })

    expect(beneficiaire.commune).toBe('Évreux')
    expect(beneficiaire.communeCodePostal).toBe('27000')
    expect(beneficiaire.communeCodeInsee).toBe('27229')
  })

  test('n’écrase jamais une commune existante (et saute le géocodage)', async () => {
    mockedCommuneFields.mockResolvedValue(evreux)
    await seedRdvUser()
    const beneficiaireId = await seedLinkedBeneficiaire({
      commune: 'Paris',
      communeCodePostal: '75001',
      communeCodeInsee: '75101',
    })

    await creerOuFusionnerBeneficiairesDepuisUsagersExternes({
      usagers: [usager],
      mediateurId,
    })

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: beneficiaireId },
    })

    expect(beneficiaire.commune).toBe('Paris')
    expect(beneficiaire.communeCodePostal).toBe('75001')
    expect(mockedCommuneFields).not.toHaveBeenCalled()
  })

  test('normalise le téléphone entrant au format E.164', async () => {
    await seedRdvUser()

    const { merges } = await creerOuFusionnerBeneficiairesDepuisUsagersExternes(
      {
        usagers: [
          {
            rdvUserId,
            nom: 'Tel',
            prenom: 'National',
            telephone: '06 11 22 33 44',
            email: null,
            adresse: null,
            birthDate: null,
          },
        ],
        mediateurId,
      },
    )
    trackBeneficiaire(merges[0].id)

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: merges[0].id },
    })
    expect(beneficiaire.telephone).toBe('+33611223344')
  })

  test('remplace par null un téléphone non normalisable et met l’email en minuscules', async () => {
    await seedRdvUser()

    const { merges } = await creerOuFusionnerBeneficiairesDepuisUsagersExternes(
      {
        usagers: [
          {
            rdvUserId,
            nom: 'Tel',
            prenom: 'Invalide',
            telephone: 'pas-un-numero',
            email: '  MAJ@Example.COM ',
            adresse: null,
            birthDate: null,
          },
        ],
        mediateurId,
      },
    )
    trackBeneficiaire(merges[0].id)

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: merges[0].id },
    })
    expect(beneficiaire.telephone).toBeNull()
    expect(beneficiaire.email).toBe('maj@example.com')
  })

  test('normalise une date de naissance absente (sentinelle 1900) en année nulle', async () => {
    await seedRdvUser()

    const { merges } = await creerOuFusionnerBeneficiairesDepuisUsagersExternes(
      {
        usagers: [
          {
            rdvUserId,
            nom: 'Naissance',
            prenom: 'Sentinelle',
            telephone: null,
            email: null,
            adresse: null,
            birthDate: new Date('1900-01-01'),
          },
        ],
        mediateurId,
      },
    )
    trackBeneficiaire(merges[0].id)

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: merges[0].id },
    })
    expect(beneficiaire.anneeNaissance).toBeNull()
    expect(beneficiaire.trancheAge).toBeNull()
  })

  test('conserve une année de naissance valide', async () => {
    await seedRdvUser()

    const { merges } = await creerOuFusionnerBeneficiairesDepuisUsagersExternes(
      {
        usagers: [
          {
            rdvUserId,
            nom: 'Naissance',
            prenom: 'Valide',
            telephone: null,
            email: null,
            adresse: null,
            birthDate: new Date('1990-05-15'),
          },
        ],
        mediateurId,
      },
    )
    trackBeneficiaire(merges[0].id)

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: merges[0].id },
    })
    expect(beneficiaire.anneeNaissance).toBe(1990)
  })
})
