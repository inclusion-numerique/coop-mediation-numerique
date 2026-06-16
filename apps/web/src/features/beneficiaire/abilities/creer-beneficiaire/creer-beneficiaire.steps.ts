import assert from 'node:assert'
import { CreerBeneficiaireValidation } from '@app/web/features/beneficiaire/abilities/creer-beneficiaire'
import { creerBeneficiaire } from '@app/web/features/beneficiaire/abilities/creer-beneficiaire/implementation'
import {
  beneficiairesCountAtScenarioStart,
  mediateurBeneficiairesCount,
  testMediateurId,
  trackBeneficiaire,
} from '@app/web/features/beneficiaire/beneficiaire.cucumber'
import type { BeneficiaireIdentifie } from '@app/web/features/beneficiaire/domain/beneficiaire'
import { assertMatchesDataTable } from '@app/web/libraries/cucumber'
import { type DataTable, Then, When } from '@cucumber/cucumber'

let lastCreated: BeneficiaireIdentifie | undefined

const creer = async (form: Record<string, unknown>): Promise<void> => {
  const beneficiaire = CreerBeneficiaireValidation.parse(form)
  lastCreated = await creerBeneficiaire({
    beneficiaire,
    mediateurId: testMediateurId,
  })
  trackBeneficiaire(lastCreated.id)
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
    assert.strictEqual(
      await mediateurBeneficiairesCount(),
      beneficiairesCountAtScenarioStart() + delta,
    )
  },
)

Then("la tranche d'âge du bénéficiaire est {string}", (expected: string) => {
  assert.ok(lastCreated, 'Aucun bénéficiaire créé')
  assert.strictEqual(lastCreated.trancheAge, expected)
})
