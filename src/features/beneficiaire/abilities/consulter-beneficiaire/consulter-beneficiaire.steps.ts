import assert from 'node:assert'
import { assertMatchesDataTable } from '@arckit/cucumber'
import { type DataTable, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { consulterBeneficiaire } from '@/features/beneficiaire/abilities/consulter-beneficiaire/implementations/prisma/consulter-beneficiaire.query'
import {
  seedBeneficiaire,
  testMediateurId,
} from '@/features/beneficiaire/beneficiaire.cucumber'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'

type ConsultationResult = Awaited<ReturnType<typeof consulterBeneficiaire>>

const contexte: {
  result?: ConsultationResult | undefined
} = {}

When(
  'je consulte un bénéficiaire enregistré avec les données suivantes',
  async (dataTable: DataTable) => {
    const data = Object.fromEntries(dataTable.rows())
    const id = await seedBeneficiaire({ prenom: data.prenom, nom: data.nom })
    contexte.result = await consulterBeneficiaire({
      beneficiaireId: BeneficiaireId(id),
      mediateurId: testMediateurId,
      maintenant: new Date(),
    })
  },
)

When('je consulte un bénéficiaire inexistant', async () => {
  contexte.result = await consulterBeneficiaire({
    beneficiaireId: BeneficiaireId(v4()),
    mediateurId: testMediateurId,
    maintenant: new Date(),
  })
})

Then(
  'la consultation retourne le bénéficiaire avec les données suivantes',
  (dataTable: DataTable) => {
    assert.ok(contexte.result, 'Aucun bénéficiaire consulté')
    assertMatchesDataTable(dataTable)(contexte.result)
  },
)

Then('la consultation ne retourne aucun bénéficiaire', () => {
  assert.strictEqual(contexte.result, null)
})
