import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { fusionnerBeneficiaires as fusionnerBeneficiairesAvec } from '@/features/beneficiaire/abilities/fusionner-beneficiaires/domain/fusionner-beneficiaires'
import {
  enregistrerLaFusion,
  lireLesBeneficiairesAFusionner,
} from '@/features/beneficiaire/abilities/fusionner-beneficiaires/implementations/prisma/index'
import {
  beneficiaireDUnAutreMediateur,
  seedBeneficiaire,
  testMediateurId,
} from '@/features/beneficiaire/beneficiaire.cucumber'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'

const fusionnerBeneficiaires = fusionnerBeneficiairesAvec({
  lireLesBeneficiairesAFusionner,
  enregistrerLaFusion,
})

type FusionResult = Awaited<ReturnType<typeof fusionnerBeneficiaires>>

const contexte: {
  destinationId?: string | undefined
  sourceId?: string | undefined
  result?: FusionResult | undefined
  ecritureRefusee?: boolean
} = {}

Given('un bénéficiaire destination sans email', async () => {
  contexte.destinationId = await seedBeneficiaire({
    prenom: 'Jean',
    nom: 'Dupont',
    email: null,
  })
})

Given("un bénéficiaire source avec l'email {string}", async (email: string) => {
  contexte.sourceId = await seedBeneficiaire({
    prenom: 'Jean',
    nom: 'Dupont',
    email,
  })
})

When('je fusionne la source dans la destination', async () => {
  assert.ok(contexte.sourceId && contexte.destinationId)
  contexte.result = await fusionnerBeneficiaires({
    sourceId: BeneficiaireId(contexte.sourceId),
    destinationId: BeneficiaireId(contexte.destinationId),
    mediateurId: testMediateurId,
    maintenant: new Date(),
  })
})

When('je fusionne une source inexistante dans la destination', async () => {
  assert.ok(contexte.destinationId)
  contexte.result = await fusionnerBeneficiaires({
    sourceId: BeneficiaireId(v4()),
    destinationId: BeneficiaireId(contexte.destinationId),
    mediateurId: testMediateurId,
    maintenant: new Date(),
  })
})

When('je fusionne la source dans une destination inexistante', async () => {
  assert.ok(contexte.sourceId)
  contexte.result = await fusionnerBeneficiaires({
    sourceId: BeneficiaireId(contexte.sourceId),
    destinationId: BeneficiaireId(v4()),
    mediateurId: testMediateurId,
    maintenant: new Date(),
  })
})

When(
  "je fusionne le bénéficiaire de l'autre médiateur dans la destination",
  async () => {
    assert.ok(contexte.destinationId)
    contexte.result = await fusionnerBeneficiaires({
      sourceId: BeneficiaireId(await beneficiaireDUnAutreMediateur()),
      destinationId: BeneficiaireId(contexte.destinationId),
      mediateurId: testMediateurId,
      maintenant: new Date(),
    })
  },
)

When(
  "l'écriture de la fusion verse le bénéficiaire de l'autre médiateur dans la destination",
  async () => {
    assert.ok(contexte.destinationId)
    contexte.ecritureRefusee = await enregistrerLaFusion({
      sourceId: BeneficiaireId(await beneficiaireDUnAutreMediateur()),
      destinationId: BeneficiaireId(contexte.destinationId),
      mediateurId: testMediateurId,
      donneesDeLaDestination: {},
      creation: new Date(),
      maintenant: new Date(),
    }).then(
      () => false,
      () => true,
    )
  },
)

Then("l'écriture de la fusion est refusée", () => {
  assert.strictEqual(contexte.ecritureRefusee, true)
})

Then('la fusion réussit', () => {
  assert.ok(contexte.result?.success, 'La fusion a échoué')
})

Then("la destination porte l'email {string}", async (email: string) => {
  assert.ok(contexte.destinationId)
  const row = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: contexte.destinationId },
    select: { email: true },
  })
  assert.strictEqual(row.email, email)
})

Then('la source est marquée fusionnée vers la destination', async () => {
  assert.ok(contexte.sourceId)
  const row = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: contexte.sourceId },
    select: { suppression: true, fusionVersId: true },
  })
  assert.ok(row.suppression, 'La source devrait être supprimée')
  assert.strictEqual(row.fusionVersId, contexte.destinationId)
})

Then("la fusion échoue avec l'erreur {string}", (tag: string) => {
  assert.ok(
    contexte.result && !contexte.result.success,
    'La fusion aurait dû échouer',
  )
  assert.strictEqual(contexte.result.error._tag, tag)
})
