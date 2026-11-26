import { v4 } from 'uuid'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { AdresseIndisponible } from '@/libraries/ban'
import { creerOuFusionnerDepuisUsagerExterne } from '../../domain/creer-ou-fusionner-depuis-usager-externe'
import type {
  CommuneFields,
  UsagerExterneAFusionner,
} from '../../domain/usager-externe'
import { communeDeLAdresseAvec } from '../ban/commune-de-l-adresse.query'
import { lireLeBeneficiaireLie } from './beneficiaire-lie.query'
import { creerLeBeneficiaire } from './creer-le-beneficiaire.mutation'
import { trouverUnDoublon } from './doublon-de-l-usager.query'
import { mettreAJourLeBeneficiaire } from './mettre-a-jour-le-beneficiaire.mutation'

const evreux = {
  commune: 'Évreux',
  communeCodePostal: '27000',
  communeCodeInsee: '27229',
}

const rdvUserId = 990_101
const utilisateurId = '45661444-bbca-4961-9944-32cfa9695a4a'
const mediateurId = '44aed6e1-ffcd-433c-8018-e50f5f554709'

const usager: UsagerExterneAFusionner = {
  rdvUserId,
  nom: 'Pitre-Test',
  prenom: 'Sylvie',
  telephone: null,
  email: null,
  adresse: '12 rue de la Paix, 27000 Évreux',
  birthDate: null,
}

const fusionnerAvec =
  (rechercher: (adresse: string) => Promise<CommuneFields | null>) =>
  async ({
    usagers,
    mediateurId,
  }: {
    usagers: UsagerExterneAFusionner[]
    mediateurId: string
  }) => {
    const fusion = await creerOuFusionnerDepuisUsagerExterne({
      lireLeBeneficiaireLie,
      trouverUnDoublon,
      communeDeLAdresse: communeDeLAdresseAvec(rechercher),
      mettreAJourLeBeneficiaire,
      creerLeBeneficiaire,
    })({
      usagers,
      mediateurId: MediateurId(mediateurId),
      maintenant: new Date(),
    })
    return fusion.data
  }

const avecLaBan = fusionnerAvec(async (adresse) =>
  adresse === usager.adresse ? evreux : null,
)

const sansCommuneTrouvee = fusionnerAvec(async () => null)

const banIndisponible = fusionnerAvec(async () => {
  throw new AdresseIndisponible('HTTP 503')
})

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

describe('créer ou fusionner depuis un usager externe — géocodage commune', () => {
  beforeAll(async () => {
    await prismaClient.user.create({
      data: {
        id: utilisateurId,
        email: `usager-externe-${utilisateurId}@integration.test`,
        mediateur: { create: { id: mediateurId } },
      },
    })
  })

  afterAll(async () => {
    await prismaClient.beneficiaire.deleteMany({ where: { mediateurId } })
    await prismaClient.mediateur.delete({ where: { id: mediateurId } })
    await prismaClient.user.delete({ where: { id: utilisateurId } })
  })

  afterEach(async () => {
    await prismaClient.beneficiaire.deleteMany({
      where: { id: { in: createdBeneficiaireIds } },
    })
    createdBeneficiaireIds.length = 0
    await prismaClient.rdvUser.deleteMany({ where: { id: rdvUserId } })
  })

  test('renseigne la commune à la création depuis un usager RDV', async () => {
    await seedRdvUser()

    const { merges } = await avecLaBan({
      usagers: [usager],
      mediateurId,
    })
    trackBeneficiaire(merges[0]?.id ?? '')

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: merges[0]?.id ?? '' },
    })

    expect(beneficiaire.commune).toBe('Évreux')
    expect(beneficiaire.communeCodePostal).toBe('27000')
    expect(beneficiaire.communeCodeInsee).toBe('27229')
  })

  test('crée la fiche sans commune quand le service d’adresse est indisponible', async () => {
    await seedRdvUser()

    const { merges } = await banIndisponible({
      usagers: [usager],
      mediateurId,
    })
    trackBeneficiaire(merges[0]?.id ?? '')

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: merges[0]?.id ?? '' },
    })

    expect(beneficiaire.commune).toBeNull()
    expect(beneficiaire.communeCodeInsee).toBeNull()
  })

  test('renseigne la commune en fusionnant dans une fiche liée sans commune', async () => {
    await seedRdvUser()
    const beneficiaireId = await seedLinkedBeneficiaire({
      commune: null,
      communeCodePostal: null,
      communeCodeInsee: null,
    })

    await avecLaBan({
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

  test('n’écrase jamais une commune existante', async () => {
    await seedRdvUser()
    const beneficiaireId = await seedLinkedBeneficiaire({
      commune: 'Paris',
      communeCodePostal: '75001',
      communeCodeInsee: '75101',
    })

    await avecLaBan({
      usagers: [usager],
      mediateurId,
    })

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: beneficiaireId },
    })

    expect(beneficiaire.commune).toBe('Paris')
    expect(beneficiaire.communeCodePostal).toBe('75001')
  })

  test('normalise le téléphone entrant au format E.164', async () => {
    await seedRdvUser()

    const { merges } = await sansCommuneTrouvee({
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
    })
    trackBeneficiaire(merges[0]?.id ?? '')

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: merges[0]?.id ?? '' },
    })
    expect(beneficiaire.telephone).toBe('+33611223344')
  })

  test('remplace par null un téléphone non normalisable et met l’email en minuscules', async () => {
    await seedRdvUser()

    const { merges } = await sansCommuneTrouvee({
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
    })
    trackBeneficiaire(merges[0]?.id ?? '')

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: merges[0]?.id ?? '' },
    })
    expect(beneficiaire.telephone).toBeNull()
    expect(beneficiaire.email).toBe('maj@example.com')
  })

  test('normalise une date de naissance absente (sentinelle 1900) en année nulle', async () => {
    await seedRdvUser()

    const { merges } = await sansCommuneTrouvee({
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
    })
    trackBeneficiaire(merges[0]?.id ?? '')

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: merges[0]?.id ?? '' },
    })
    expect(beneficiaire.anneeNaissance).toBeNull()
    expect(beneficiaire.trancheAge).toBeNull()
  })

  test('conserve une année de naissance valide', async () => {
    await seedRdvUser()

    const { merges } = await sansCommuneTrouvee({
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
    })
    trackBeneficiaire(merges[0]?.id ?? '')

    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: merges[0]?.id ?? '' },
    })
    expect(beneficiaire.anneeNaissance).toBe(1990)
  })
})
