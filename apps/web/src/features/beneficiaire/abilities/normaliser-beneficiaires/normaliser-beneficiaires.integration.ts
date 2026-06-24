import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { normaliserBeneficiaires } from './implementation'

const nationalId = v4()
const emailId = v4()
const communeId = v4()
const invalidId = v4()
const canoniqueId = v4()
const multiId = v4()

const ids = [nationalId, emailId, communeId, invalidId, canoniqueId, multiId]

const oldModification = new Date('2020-01-01T00:00:00.000Z')

const fiche = async (id: string) =>
  prismaClient.beneficiaire.findUniqueOrThrow({ where: { id } })

describe('normaliserBeneficiaires', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
  }, 100_000)

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
      ],
    })

    const result = await normaliserBeneficiaires()

    const national = await fiche(nationalId)
    expect(national.telephone).toBe('+33601020304')
    // modification préservée malgré la mise à jour (pas de bump)
    expect(national.modification).toEqual(oldModification)

    expect((await fiche(emailId)).email).toBe('jean.dupont@exemple.com')

    const commune = await fiche(communeId)
    expect(commune.communeCodePostal).toBe('75001')
    expect(commune.communeCodeInsee).toBe('75101')

    // réparation câblée dans le backfill (couverture exhaustive : repair-telephone.spec)
    expect((await fiche(multiId)).telephone).toBe('+33651764142')

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
})
