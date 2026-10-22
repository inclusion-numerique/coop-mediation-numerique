import assert from 'node:assert'
import { semerUnCompteDeListe } from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { reinitialiserUneFixture } from './commands/reinitialiser-une-fixture'

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
  reinitialisation.resultat = await reinitialiserUneFixture(
    reinitialisation.compteId,
  )
})

Then("la réinitialisation échoue avec l'erreur {string}", (attendu: string) => {
  const { resultat } = reinitialisation
  assert.ok(resultat && !resultat.success, 'La réinitialisation a abouti')
  assert.strictEqual(resultat.error._tag, attendu)
})
