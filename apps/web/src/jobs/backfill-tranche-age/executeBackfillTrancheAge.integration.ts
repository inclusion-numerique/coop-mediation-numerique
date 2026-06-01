import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { executeBackfillTrancheAge } from './executeBackfillTrancheAge'

const currentYear = new Date().getFullYear()

const divergentId = v4() // birth year present, stored tranche NULL (the RDVSP bug)
const staleId = v4() // birth year present, stored tranche stale/inconsistent
const trancheOnlyId = v4() // no birth year, tranche set by hand (must be untouched)

describe('executeBackfillTrancheAge', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
  }, 100_000)

  afterEach(async () => {
    await prismaClient.beneficiaire.deleteMany({
      where: { id: { in: [divergentId, staleId, trancheOnlyId] } },
    })
  })

  test('recomputes tranche_age from the birth year only where it diverges', async () => {
    await prismaClient.beneficiaire.createMany({
      data: [
        {
          id: divergentId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Divergent',
          nom: 'Backfill',
          anneeNaissance: currentYear - 65,
          trancheAge: null,
        },
        {
          id: staleId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Stale',
          nom: 'Backfill',
          anneeNaissance: currentYear - 65,
          trancheAge: 'QuaranteCinquanteNeuf',
        },
        {
          id: trancheOnlyId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: true,
          trancheAge: 'DixHuitVingtQuatre',
          anneeNaissance: null,
        },
      ],
    })

    await executeBackfillTrancheAge({
      name: 'backfill-tranche-age',
      payload: {},
    })

    const [divergent, stale, trancheOnly] = await Promise.all([
      prismaClient.beneficiaire.findUniqueOrThrow({
        where: { id: divergentId },
      }),
      prismaClient.beneficiaire.findUniqueOrThrow({ where: { id: staleId } }),
      prismaClient.beneficiaire.findUniqueOrThrow({
        where: { id: trancheOnlyId },
      }),
    ])

    expect(divergent.trancheAge).toBe('SoixanteSoixanteNeuf')
    expect(stale.trancheAge).toBe('SoixanteSoixanteNeuf')
    // No usable birth year: the hand-picked tranche must be preserved.
    expect(trancheOnly.trancheAge).toBe('DixHuitVingtQuatre')
  })
})
