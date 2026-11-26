import assert from 'node:assert'
import { assertMatchesDataTable } from '@arckit/cucumber'
import { type DataTable, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { CreerBeneficiaireValidation } from '@/features/beneficiaire/abilities/creer-beneficiaire/action/creer-beneficiaire.validation'
import { creerBeneficiaire } from '@/features/beneficiaire/abilities/creer-beneficiaire/domain/creer-beneficiaire'
import { enregistrerLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-beneficiaire/implementations/prisma/creer-beneficiaire.mutation'
import {
  nombreDeBeneficiairesAuDebutDuScenario,
  nombreDeBeneficiairesDuMediateur,
  suivreLeBeneficiaire,
  testMediateurId,
} from '@/features/beneficiaire/beneficiaire.cucumber'
import type { BeneficiaireIdentifie } from '@/features/beneficiaire/domain/beneficiaire'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'

let lastCreated: BeneficiaireIdentifie | undefined

const creer = async (form: Record<string, unknown>): Promise<void> => {
  const beneficiaire = CreerBeneficiaireValidation.parse(form)
  const creation = await creerBeneficiaire({ enregistrerLeBeneficiaire })({
    beneficiaire,
    beneficiaireId: BeneficiaireId(v4()),
    mediateurId: testMediateurId,
    maintenant: new Date(),
  })
  lastCreated = creation.data
  suivreLeBeneficiaire(lastCreated.id)
}

When(
  'je crée un bénéficiaire avec les données suivantes',
  async (dataTable: DataTable) => {
    const data = Object.fromEntries(dataTable.rows())
    await creer({
      prenom: data.prenom,
      nom: data.nom,
      trancheAge: data.trancheAge,
    })
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
      await nombreDeBeneficiairesDuMediateur(),
      nombreDeBeneficiairesAuDebutDuScenario() + delta,
    )
  },
)

Then("la tranche d'âge du bénéficiaire est {string}", (expected: string) => {
  assert.ok(lastCreated, 'Aucun bénéficiaire créé')
  assert.strictEqual(lastCreated.trancheAge, expected)
})
