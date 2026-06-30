import assert from 'node:assert'
import { supprimerBeneficiaires } from '@app/web/features/beneficiaire/abilities/supprimer-beneficiaires/implementation'
import {
  beneficiairesCountAtScenarioStart,
  mediateurBeneficiairesCount,
  seedBeneficiaire,
  testMediateurId,
} from '@app/web/features/beneficiaire/beneficiaire.cucumber'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

type SuppressionResult = Awaited<ReturnType<typeof supprimerBeneficiaires>>

let targetId: string | undefined
let result: SuppressionResult | undefined

Given('un bénéficiaire enregistré pour ce médiateur', async () => {
  targetId = await seedBeneficiaire({ prenom: 'Jean', nom: 'Dupont' })
})

When('je supprime ce bénéficiaire', async () => {
  assert.ok(targetId, 'Aucun bénéficiaire à supprimer')
  result = await supprimerBeneficiaires({
    ids: [BeneficiaireId(targetId)],
    mediateurId: testMediateurId,
  })
})

When('je supprime un bénéficiaire inexistant', async () => {
  result = await supprimerBeneficiaires({
    ids: [BeneficiaireId(v4())],
    mediateurId: testMediateurId,
  })
})

Then('la suppression retire {int} bénéficiaire', (count: number) => {
  assert.ok(result?.success, 'La suppression a échoué')
  assert.strictEqual(result.data.deleted, count)
})

Then('le bénéficiaire est anonymisé et marqué supprimé', async () => {
  assert.ok(targetId)
  const row = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: targetId },
    select: { anonyme: true, suppression: true, prenom: true, nom: true },
  })
  assert.strictEqual(row.anonyme, true)
  assert.ok(row.suppression, 'suppression devrait être renseignée')
  assert.strictEqual(row.prenom, null)
  assert.strictEqual(row.nom, null)
})

Then(
  'le compteur de bénéficiaires du médiateur revient à son niveau initial',
  async () => {
    assert.strictEqual(
      await mediateurBeneficiairesCount(),
      beneficiairesCountAtScenarioStart(),
    )
  },
)

Then("la suppression échoue avec l'erreur {string}", (tag: string) => {
  assert.ok(result && !result.success, 'La suppression aurait dû échouer')
  assert.strictEqual(result.error._tag, tag)
})
