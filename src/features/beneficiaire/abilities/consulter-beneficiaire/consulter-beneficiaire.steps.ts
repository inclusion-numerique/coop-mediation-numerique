import assert from 'node:assert'
import { consulterBeneficiaire } from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/implementation'
import {
  seedBeneficiaire,
  testMediateurId,
} from '@app/web/features/beneficiaire/beneficiaire.cucumber'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { assertMatchesDataTable } from '@arckit/cucumber'
import { type DataTable, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

type ConsultationResult = Awaited<ReturnType<typeof consulterBeneficiaire>>

let result: ConsultationResult | undefined

When(
  'je consulte un bénéficiaire enregistré avec les données suivantes',
  async (dataTable: DataTable) => {
    const data = Object.fromEntries(dataTable.rows())
    const id = await seedBeneficiaire({ prenom: data.prenom, nom: data.nom })
    result = await consulterBeneficiaire({
      beneficiaireId: BeneficiaireId(id),
      mediateurId: testMediateurId,
    })
  },
)

When('je consulte un bénéficiaire inexistant', async () => {
  result = await consulterBeneficiaire({
    beneficiaireId: BeneficiaireId(v4()),
    mediateurId: testMediateurId,
  })
})

Then(
  'la consultation retourne le bénéficiaire avec les données suivantes',
  (dataTable: DataTable) => {
    assert.ok(result, 'Aucun bénéficiaire consulté')
    assertMatchesDataTable(dataTable)(result)
  },
)

Then('la consultation ne retourne aucun bénéficiaire', () => {
  assert.strictEqual(result, null)
})
