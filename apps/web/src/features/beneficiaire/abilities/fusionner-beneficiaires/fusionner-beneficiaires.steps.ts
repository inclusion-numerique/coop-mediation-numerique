import assert from 'node:assert'
import { fusionnerBeneficiaires } from '@app/web/features/beneficiaire/abilities/fusionner-beneficiaires/implementation'
import {
  seedBeneficiaire,
  testMediateurId,
} from '@app/web/features/beneficiaire/beneficiaire.cucumber'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

type FusionResult = Awaited<ReturnType<typeof fusionnerBeneficiaires>>

let destinationId: string | undefined
let sourceId: string | undefined
let result: FusionResult | undefined

Given('un bénéficiaire destination sans email', async () => {
  destinationId = await seedBeneficiaire({
    prenom: 'Jean',
    nom: 'Dupont',
    email: null,
  })
})

Given("un bénéficiaire source avec l'email {string}", async (email: string) => {
  sourceId = await seedBeneficiaire({ prenom: 'Jean', nom: 'Dupont', email })
})

When('je fusionne la source dans la destination', async () => {
  assert.ok(sourceId && destinationId)
  result = await fusionnerBeneficiaires({
    sourceId: BeneficiaireId(sourceId),
    destinationId: BeneficiaireId(destinationId),
    mediateurId: testMediateurId,
  })
})

When('je fusionne une source inexistante dans la destination', async () => {
  assert.ok(destinationId)
  result = await fusionnerBeneficiaires({
    sourceId: BeneficiaireId(v4()),
    destinationId: BeneficiaireId(destinationId),
    mediateurId: testMediateurId,
  })
})

When('je fusionne la source dans une destination inexistante', async () => {
  assert.ok(sourceId)
  result = await fusionnerBeneficiaires({
    sourceId: BeneficiaireId(sourceId),
    destinationId: BeneficiaireId(v4()),
    mediateurId: testMediateurId,
  })
})

Then('la fusion réussit', () => {
  assert.ok(result?.success, 'La fusion a échoué')
})

Then("la destination porte l'email {string}", async (email: string) => {
  assert.ok(destinationId)
  const row = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: destinationId },
    select: { email: true },
  })
  assert.strictEqual(row.email, email)
})

Then('la source est marquée fusionnée vers la destination', async () => {
  assert.ok(sourceId)
  const row = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: sourceId },
    select: { suppression: true, fusionVersId: true },
  })
  assert.ok(row.suppression, 'La source devrait être supprimée')
  assert.strictEqual(row.fusionVersId, destinationId)
})

Then("la fusion échoue avec l'erreur {string}", (tag: string) => {
  assert.ok(result && !result.success, 'La fusion aurait dû échouer')
  assert.strictEqual(result.error._tag, tag)
})
