import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { scoredCommuneFieldsFromAddress } from '@app/web/external-apis/ban/communeFieldsFromAddress'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { normaliserBeneficiaires } from './implementation'

jest.mock('@app/web/external-apis/ban/communeFieldsFromAddress', () => ({
  scoredCommuneFieldsFromAddress: jest.fn(),
  communeFieldsFromAddress: jest.fn(),
}))

const mockedScored = scoredCommuneFieldsFromAddress as jest.MockedFunction<
  typeof scoredCommuneFieldsFromAddress
>

const nationalId = v4()
const emailId = v4()
const emailAbimeId = v4()
const communeId = v4()
const invalidId = v4()
const canoniqueId = v4()
const multiId = v4()
const tiretId = v4()
const placeholderId = v4()
const dryRunId = v4()
const communePartielleId = v4()

const ids = [
  nationalId,
  emailId,
  emailAbimeId,
  communeId,
  invalidId,
  canoniqueId,
  multiId,
  tiretId,
  placeholderId,
  dryRunId,
  communePartielleId,
]

const oldModification = new Date('2020-01-01T00:00:00.000Z')

const fiche = async (id: string) =>
  prismaClient.beneficiaire.findUniqueOrThrow({ where: { id } })

describe('normaliserBeneficiaires', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
  }, 100_000)

  beforeEach(() => {
    // Par défaut la BAN ne résout rien : les fiches à commune partielle sont
    // préservées telles quelles (aucun appel réseau réel dans les tests).
    mockedScored.mockReset()
    mockedScored.mockResolvedValue(null)
  })

  afterEach(async () => {
    await prismaClient.beneficiaire.deleteMany({ where: { id: { in: ids } } })
  })

  test('re-canonicalizes fields, preserves modification, reports invalid', async () => {
    await prismaClient.beneficiaire.createMany({
      data: [
        {
          id: nationalId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Nat',
          nom: 'Ional',
          telephone: '0601020304',
          modification: oldModification,
        },
        {
          id: emailId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Up',
          nom: 'Per',
          email: 'JEAN.DUPONT@EXEMPLE.COM',
        },
        {
          id: emailAbimeId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Ab',
          nom: 'Ime',
          email: 'jean.dupont@gmailcom;',
        },
        {
          id: communeId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Com',
          nom: 'Mune',
          commune: 'Paris',
          communeCodePostal: '75 001',
          communeCodeInsee: '75 101',
        },
        {
          id: invalidId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'In',
          nom: 'Valide',
          telephone: 'pas-un-numero',
        },
        {
          id: canoniqueId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Deja',
          nom: 'Canonique',
          telephone: '+33601020304',
          pasDeTelephone: false,
        },
        {
          id: multiId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Multi',
          nom: 'Numero',
          telephone: '0651764142 / 0782950623',
        },
        {
          id: tiretId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Tiret',
          nom: 'Vide',
          telephone: '-',
        },
        {
          id: placeholderId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Place',
          nom: 'Holder',
          telephone: '0000000000',
          email: 'A créer',
        },
      ],
    })

    const result = await normaliserBeneficiaires({ dryRun: false })

    const national = await fiche(nationalId)
    expect(national.telephone).toBe('+33601020304')
    // modification préservée malgré la mise à jour (pas de bump)
    expect(national.modification).toEqual(oldModification)

    expect((await fiche(emailId)).email).toBe('jean.dupont@exemple.com')

    // réparation câblée dans le backfill (couverture exhaustive : repair-email.spec)
    expect((await fiche(emailAbimeId)).email).toBe('jean.dupont@gmail.com')

    const commune = await fiche(communeId)
    expect(commune.communeCodePostal).toBe('75001')
    expect(commune.communeCodeInsee).toBe('75101')

    // réparation câblée dans le backfill (couverture exhaustive : repair-telephone.spec)
    expect((await fiche(multiId)).telephone).toBe('+33651764142')

    // valeur sans aucun chiffre (« - ») → champ vidé
    expect((await fiche(tiretId)).telephone).toBeNull()

    // placeholders (« 0000000000 », « A créer ») → champs vidés
    const placeholder = await fiche(placeholderId)
    expect(placeholder.telephone).toBeNull()
    expect(placeholder.email).toBeNull()

    // invalide : laissé tel quel (sauté, jamais corrompu)
    expect((await fiche(invalidId)).telephone).toBe('pas-un-numero')

    // le mécanisme de capture remonte des erreurs bien formées { id, reason }
    expect(result.skipped).toBeGreaterThan(0)
    expect(
      result.errors.every(
        (error) => typeof error.id === 'string' && error.reason.length > 0,
      ),
    ).toBe(true)

    expect(result.updated).toBeGreaterThanOrEqual(3)
  }, 60_000)

  test('dry run reports changes without writing', async () => {
    await prismaClient.beneficiaire.create({
      data: {
        id: dryRunId,
        mediateurId: mediateurAvecActiviteMediateurId,
        anonyme: false,
        prenom: 'Dry',
        nom: 'Run',
        telephone: '0601020304', // serait canonicalisé en +33601020304
        modification: oldModification,
      },
    })

    const result = await normaliserBeneficiaires({ dryRun: true })

    // aucune écriture : la fiche reste strictement telle quelle
    const inchangee = await fiche(dryRunId)
    expect(inchangee.telephone).toBe('0601020304')
    expect(inchangee.modification).toEqual(oldModification)

    // mais le changement qui aurait été appliqué est bien rapporté
    expect(result.dryRun).toBe(true)
    const change = result.changes.find((c) => c.id === dryRunId)
    expect(change?.telephoneAvant).toBe('0601020304')
    expect(change?.telephoneApres).toBe('+33601020304')
    // le rapport nomme les colonnes modifiées : aucun changement « invisible »
    expect(change?.champsModifies).toContain('telephone')
  }, 60_000)

  test('fills a partial commune by geocoding when BAN matches confidently', async () => {
    mockedScored.mockImplementation(async (address) =>
      address === '12 rue de la Paix'
        ? {
            commune: 'Évreux',
            communeCodePostal: '27000',
            communeCodeInsee: '27229',
            score: 0.97,
          }
        : null,
    )

    await prismaClient.beneficiaire.create({
      data: {
        id: communePartielleId,
        mediateurId: mediateurAvecActiviteMediateurId,
        anonyme: false,
        prenom: 'Par',
        nom: 'Tielle',
        adresse: '12 rue de la Paix',
        commune: null,
        communeCodePostal: null,
        communeCodeInsee: null,
      },
    })

    await normaliserBeneficiaires({ dryRun: false })

    const remplie = await fiche(communePartielleId)
    expect(remplie.adresse).toBe('12 rue de la Paix')
    expect(remplie.commune).toBe('Évreux')
    expect(remplie.communeCodePostal).toBe('27000')
    expect(remplie.communeCodeInsee).toBe('27229')
  }, 60_000)

  test('preserves a partial commune (never erases) when BAN is uncertain', async () => {
    // Commune INCOMPLÈTE (INSEE manquant, adresse texte seule) que la BAN ne
    // résout pas : on ne nullifie ni la commune ni l'adresse.
    mockedScored.mockResolvedValue(null)

    await prismaClient.beneficiaire.create({
      data: {
        id: communePartielleId,
        mediateurId: mediateurAvecActiviteMediateurId,
        anonyme: false,
        prenom: 'Par',
        nom: 'Tielle',
        adresse: '12 rue introuvable',
        commune: 'Évreux',
        communeCodePostal: '27000',
        communeCodeInsee: null,
      },
    })

    await normaliserBeneficiaires({ dryRun: false })

    const preservee = await fiche(communePartielleId)
    expect(preservee.adresse).toBe('12 rue introuvable')
    expect(preservee.commune).toBe('Évreux')
    expect(preservee.communeCodePostal).toBe('27000')
    expect(preservee.communeCodeInsee).toBeNull()
  }, 60_000)
})
