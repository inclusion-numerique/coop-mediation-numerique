import assert from 'node:assert'
import { assertMatchesDataTable } from '@arckit/cucumber'
import { type DataTable, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { ModifierBeneficiaireValidation } from '@/features/beneficiaire/abilities/modifier-beneficiaire/action/modifier-beneficiaire.validation'
import { modifierBeneficiaire as modifierBeneficiaireAvec } from '@/features/beneficiaire/abilities/modifier-beneficiaire/domain/modifier-beneficiaire'
import { creationDuBeneficiaire } from '@/features/beneficiaire/abilities/modifier-beneficiaire/implementations/prisma/creation-du-beneficiaire.query'
import { enregistrerLaModification } from '@/features/beneficiaire/abilities/modifier-beneficiaire/implementations/prisma/enregistrer-la-modification.mutation'
import {
  seedBeneficiaire,
  testMediateurId,
} from '@/features/beneficiaire/beneficiaire.cucumber'

const modifierBeneficiaire = modifierBeneficiaireAvec({
  creationDuBeneficiaire,
  enregistrerLaModification,
})

type ModificationResult = Awaited<ReturnType<typeof modifierBeneficiaire>>

const contexte: {
  targetId?: string | undefined
  creationBefore?: Date | undefined
  result?: ModificationResult | undefined
} = {}

Given('un bénéficiaire {string} de ce médiateur', async (fullName: string) => {
  const [prenom, nom] = fullName.split(' ')
  contexte.targetId = await seedBeneficiaire({
    ...(prenom === undefined ? {} : { prenom }),
    ...(nom === undefined ? {} : { nom }),
  })
  contexte.creationBefore = (
    await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: contexte.targetId },
      select: { creation: true },
    })
  ).creation
})

When(
  'je modifie ce bénéficiaire avec les données suivantes',
  async (dataTable: DataTable) => {
    assert.ok(contexte.targetId, 'Aucun bénéficiaire à modifier')
    const data = Object.fromEntries(dataTable.rows())
    const beneficiaire = ModifierBeneficiaireValidation.parse({
      id: contexte.targetId,
      prenom: data.prenom,
      nom: data.nom,
      trancheAge: data.trancheAge,
    })
    contexte.result = await modifierBeneficiaire({
      beneficiaire,
      mediateurId: testMediateurId,
      maintenant: new Date(),
    })
  },
)

When('je modifie un bénéficiaire inexistant', async () => {
  const beneficiaire = ModifierBeneficiaireValidation.parse({
    id: v4(),
    prenom: 'Inexistant',
    nom: 'Bénéficiaire',
  })
  contexte.result = await modifierBeneficiaire({
    beneficiaire,
    mediateurId: testMediateurId,
    maintenant: new Date(),
  })
})

Then('la modification réussit', () => {
  assert.ok(contexte.result?.success, 'La modification a échoué')
})

Then(
  'le bénéficiaire porte désormais les données suivantes',
  (dataTable: DataTable) => {
    assert.ok(contexte.result?.success, 'La modification a échoué')
    assertMatchesDataTable(dataTable)(contexte.result.data)
  },
)

Then('la date de création du bénéficiaire est inchangée', () => {
  assert.ok(contexte.result?.success, 'La modification a échoué')
  assert.deepStrictEqual(contexte.result.data.creation, contexte.creationBefore)
})

Then("la modification échoue avec l'erreur {string}", (tag: string) => {
  assert.ok(
    contexte.result && !contexte.result.success,
    'La modification aurait dû échouer',
  )
  assert.strictEqual(contexte.result.error._tag, tag)
})
