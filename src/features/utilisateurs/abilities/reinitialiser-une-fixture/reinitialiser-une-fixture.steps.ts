import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { reinitialiserUneFixture as reinitialiserLaFixture } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/domain/reinitialiser-une-fixture'
import { lireLeMarquageFixture } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/implementations/prisma/marquage-fixture.query'
import { reinitialiser } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/implementations/prisma/reinitialiser.mutation'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { semerUnCompteDeListe } from '@/features/utilisateurs/utilisateurs.cucumber'

const reinitialiserUneFixture = reinitialiserLaFixture({
  lireLeMarquageFixture,
  reinitialiser,
})

const reinitialisation: {
  compteId?: string
  resultat?: Awaited<ReturnType<typeof reinitialiserUneFixture>>
} = {}

Given('un compte réel à réinitialiser', async () => {
  reinitialisation.compteId = await semerUnCompteDeListe({
    prenom: 'Reel',
    marqueur: `Reinitialisation${v4().slice(0, 8)}`,
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-02'),
  })
})

Given(
  'un compte marqué de test absent des fixtures à réinitialiser',
  async () => {
    reinitialisation.compteId = await semerUnCompteDeListe({
      prenom: 'Test',
      marqueur: `Reinitialisation${v4().slice(0, 8)}`,
      creeLe: new Date('2026-01-01'),
      inscritLe: new Date('2026-01-02'),
      fixture: true,
    })
  },
)

When('ce compte est réinitialisé', async () => {
  assert.ok(reinitialisation.compteId, 'Aucun compte semé')
  reinitialisation.resultat = await reinitialiserUneFixture({
    utilisateurId: UtilisateurId.safe(reinitialisation.compteId),
    demonstration: {
      employeuse: { structureCoopId: '5a0c41b6-34c9-4d3b-9e0a-6b1f8a2d7c35' },
      semerLesActivitesDansLesLieux: async () => undefined,
      semerLesBeneficiaires: async () => undefined,
      semerLesCras: async () => undefined,
      semerLesCoordinations: async () => undefined,
    },
  })
})

Then("la réinitialisation échoue avec l'erreur {string}", (attendu: string) => {
  const { resultat } = reinitialisation
  assert.ok(resultat && !resultat.success, 'La réinitialisation a abouti')
  assert.strictEqual(resultat.error._tag, attendu)
})
