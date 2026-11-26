import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { supprimerBeneficiaires as supprimerBeneficiairesAvec } from '@/features/beneficiaire/abilities/supprimer-beneficiaires/domain/supprimer-beneficiaires'
import { anonymiserLesBeneficiaires } from '@/features/beneficiaire/abilities/supprimer-beneficiaires/implementations/prisma/anonymiser-les-beneficiaires.mutation'
import { beneficiairesExistants } from '@/features/beneficiaire/abilities/supprimer-beneficiaires/implementations/prisma/beneficiaires-existants.query'
import {
  beneficiaireDUnAutreMediateur,
  nombreDeBeneficiairesAuDebutDuScenario,
  nombreDeBeneficiairesDuMediateur,
  seedBeneficiaire,
  semerPortefeuille,
  testMediateurId,
} from '@/features/beneficiaire/beneficiaire.cucumber'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'

const supprimerBeneficiaires = supprimerBeneficiairesAvec({
  beneficiairesExistants,
  anonymiserLesBeneficiaires,
})

const suppression: {
  cibleId?: string
  autreId?: string
  resultat?: Awaited<ReturnType<typeof supprimerBeneficiaires>>
} = {}

const cibleId = (): string => {
  assert.ok(suppression.cibleId, 'Aucun bénéficiaire à supprimer')
  return suppression.cibleId
}

const autreId = (): string => {
  assert.ok(suppression.autreId, "Aucun bénéficiaire d'un autre médiateur")
  return suppression.autreId
}

Given('un bénéficiaire enregistré pour ce médiateur', async () => {
  suppression.cibleId = await seedBeneficiaire({
    prenom: 'Jean',
    nom: 'Dupont',
  })
})

Given('un bénéficiaire de Nice enregistré pour ce médiateur', async () => {
  suppression.cibleId = await seedBeneficiaire({
    prenom: 'Jean',
    nom: 'Dupont',
    commune: 'Nice',
    communeCodePostal: '06100,06000,06200,06300',
    communeCodeInsee: '06088',
  })
})

Given('un bénéficiaire enregistré pour un autre médiateur', async () => {
  await semerPortefeuille()
  suppression.autreId = await beneficiaireDUnAutreMediateur()
})

When('je supprime ce bénéficiaire', async () => {
  suppression.resultat = await supprimerBeneficiaires({
    ids: [BeneficiaireId(cibleId())],
    mediateurId: testMediateurId,
    maintenant: new Date(),
  })
})

When('je supprime ces deux bénéficiaires', async () => {
  suppression.resultat = await supprimerBeneficiaires({
    ids: [BeneficiaireId(cibleId()), BeneficiaireId(autreId())],
    mediateurId: testMediateurId,
    maintenant: new Date(),
  })
})

When('je supprime un bénéficiaire inexistant', async () => {
  suppression.resultat = await supprimerBeneficiaires({
    ids: [BeneficiaireId(v4())],
    mediateurId: testMediateurId,
    maintenant: new Date(),
  })
})

When(
  "l'anonymisation de ce bénéficiaire est écrite au nom de ce médiateur",
  async () => {
    await anonymiserLesBeneficiaires({
      ids: [BeneficiaireId(autreId())],
      mediateurId: testMediateurId,
      maintenant: new Date(),
    })
  },
)

Then('la suppression retire {int} bénéficiaire', (count: number) => {
  assert.ok(suppression.resultat?.success, 'La suppression a échoué')
  assert.strictEqual(suppression.resultat.data.ids.length, count)
})

Then('le bénéficiaire est anonymisé et marqué supprimé', async () => {
  const row = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: cibleId() },
    select: { anonyme: true, suppression: true, prenom: true, nom: true },
  })
  assert.strictEqual(row.anonyme, true)
  assert.ok(row.suppression, 'suppression devrait être renseignée')
  assert.strictEqual(row.prenom, null)
  assert.strictEqual(row.nom, null)
})

Then("le bénéficiaire de l'autre médiateur garde son identité", async () => {
  const row = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: autreId() },
    select: { anonyme: true, suppression: true, prenom: true, nom: true },
  })
  assert.deepStrictEqual(row, {
    anonyme: false,
    suppression: null,
    prenom: 'Paul1',
    nom: 'Durand',
  })
})

Then(
  'le compteur de bénéficiaires du médiateur revient à son niveau initial',
  async () => {
    assert.strictEqual(
      await nombreDeBeneficiairesDuMediateur(),
      nombreDeBeneficiairesAuDebutDuScenario(),
    )
  },
)

Then("la suppression échoue avec l'erreur {string}", (tag: string) => {
  assert.ok(
    suppression.resultat && !suppression.resultat.success,
    'La suppression aurait dû échouer',
  )
  assert.strictEqual(suppression.resultat.error._tag, tag)
})

Then(
  'le bénéficiaire supprimé ne garde que le code postal {string}',
  async (codePostal: string) => {
    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: cibleId() },
      select: {
        commune: true,
        communeCodePostal: true,
        communeCodeInsee: true,
      },
    })
    assert.deepStrictEqual(beneficiaire, {
      commune: 'Nice',
      communeCodePostal: codePostal,
      communeCodeInsee: '06088',
    })
  },
)
