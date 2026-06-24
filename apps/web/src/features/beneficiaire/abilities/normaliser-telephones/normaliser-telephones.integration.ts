import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { normaliserTelephones } from './implementation'

const nationalId = v4()
const invalidId = v4()
const canoniqueId = v4()

const telephoneOf = async (id: string): Promise<string | null> =>
  (
    await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id },
      select: { telephone: true },
    })
  ).telephone

describe('normaliserTelephones', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
  }, 100_000)

  afterEach(async () => {
    await prismaClient.beneficiaire.deleteMany({
      where: { id: { in: [nationalId, invalidId, canoniqueId] } },
    })
  })

  test('normalizes national phones to international, leaves invalid and canonical untouched', async () => {
    await prismaClient.beneficiaire.createMany({
      data: [
        {
          id: nationalId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Nat',
          nom: 'Ional',
          telephone: '0601020304',
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
        },
      ],
    })

    const result = await normaliserTelephones()

    expect(await telephoneOf(nationalId)).toBe('+33601020304')
    expect(await telephoneOf(invalidId)).toBe('pas-un-numero')
    expect(await telephoneOf(canoniqueId)).toBe('+33601020304')

    expect(result.updated).toBeGreaterThanOrEqual(1)
    expect(result.skipped).toBeGreaterThanOrEqual(1)
  })
})
