import assert from 'node:assert'
import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { CreerBeneficiaireValidation } from '@app/web/features/beneficiaire/abilities/creer-beneficiaire'
import { creerBeneficiaire } from '@app/web/features/beneficiaire/abilities/creer-beneficiaire/implementation'
import type { BeneficiaireIdentifie } from '@app/web/features/beneficiaire/domain/beneficiaire'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { assertMatchesDataTable } from '@app/web/libraries/cucumber'
import { prismaClient } from '@app/web/prismaClient'
import {
  After,
  Before,
  BeforeAll,
  type DataTable,
  setDefaultTimeout,
  Then,
  When,
} from '@cucumber/cucumber'

setDefaultTimeout(60_000)

const mediateurId = MediateurId(mediateurAvecActiviteMediateurId)

let createdIds: string[] = []
let countBefore = 0
let lastCreated: BeneficiaireIdentifie | undefined

const readBeneficiairesCount = async (): Promise<number> =>
  (
    await prismaClient.mediateur.findUniqueOrThrow({
      where: { id: mediateurId },
      select: { beneficiairesCount: true },
    })
  ).beneficiairesCount

BeforeAll({ timeout: 120_000 }, async () => {
  await seedStructures(prismaClient)
  await resetFixtureUser(mediateurAvecActivite, false)
})

Before(async () => {
  createdIds = []
  lastCreated = undefined
  countBefore = await readBeneficiairesCount()
})

After(async () => {
  if (createdIds.length > 0) {
    await prismaClient.beneficiaire.deleteMany({
      where: { id: { in: createdIds } },
    })
  }
  await prismaClient.mediateur.update({
    where: { id: mediateurId },
    data: { beneficiairesCount: countBefore },
  })
})

const creer = async (form: Record<string, unknown>): Promise<void> => {
  const beneficiaire = CreerBeneficiaireValidation.parse(form)
  lastCreated = await creerBeneficiaire({ beneficiaire, mediateurId })
  createdIds.push(lastCreated.id)
}

When(
  'je crée un bénéficiaire avec les données suivantes',
  async (dataTable: DataTable) => {
    const data = Object.fromEntries(dataTable.rows())
    await creer({ prenom: data.prenom, nom: data.nom })
  },
)

When('je crée un bénéficiaire né en {int}', async (annee: number) => {
  await creer({ prenom: 'Test', nom: 'Naissance', anneeNaissance: annee })
})

Then(
  'le bénéficiaire est créé avec les données suivantes',
  (dataTable: DataTable) => {
    assert.ok(lastCreated, 'Aucun bénéficiaire créé')
    assertMatchesDataTable(dataTable)(lastCreated)
  },
)

Then(
  'le compteur de bénéficiaires du médiateur est incrémenté de {int}',
  async (delta: number) => {
    assert.strictEqual(await readBeneficiairesCount(), countBefore + delta)
  },
)

Then("la tranche d'âge du bénéficiaire est {string}", (expected: string) => {
  assert.ok(lastCreated, 'Aucun bénéficiaire créé')
  assert.strictEqual(lastCreated.trancheAge, expected)
})
