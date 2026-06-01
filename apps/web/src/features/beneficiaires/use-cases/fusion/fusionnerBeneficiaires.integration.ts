import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { fusionnerBeneficiaires } from './fusionnerBeneficiaires'

const currentYear = new Date().getFullYear()

const sourceId = v4()
const destinationId = v4()

describe('fusionnerBeneficiaires', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
  }, 100_000)

  afterEach(async () => {
    await prismaClient.beneficiaire.deleteMany({
      where: { id: { in: [sourceId, destinationId] } },
    })
  })

  test('re-derives the tranche d’âge from the merged birth year so it stays coherent', async () => {
    await prismaClient.beneficiaire.createMany({
      data: [
        {
          id: destinationId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Destination',
          nom: 'Fusion',
          anneeNaissance: null,
          trancheAge: 'QuaranteCinquanteNeuf',
        },
        {
          id: sourceId,
          mediateurId: mediateurAvecActiviteMediateurId,
          anonyme: false,
          prenom: 'Source',
          nom: 'Fusion',
          anneeNaissance: currentYear - 65,
          trancheAge: 'SoixanteSoixanteNeuf',
        },
      ],
    })

    const { beneficiaireFusionne } = await fusionnerBeneficiaires({
      source: { id: sourceId },
      destination: { id: destinationId },
      mediateurId: mediateurAvecActiviteMediateurId,
    })

    expect(beneficiaireFusionne.anneeNaissance).toBe(currentYear - 65)
    expect(beneficiaireFusionne.trancheAge).toBe('SoixanteSoixanteNeuf')
  })
})
