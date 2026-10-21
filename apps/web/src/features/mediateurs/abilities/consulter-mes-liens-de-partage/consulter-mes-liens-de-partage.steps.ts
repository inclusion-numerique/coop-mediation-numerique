import assert from 'node:assert'
import { consulterMesLiensDePartage } from '@app/web/features/mediateurs/abilities/consulter-mes-liens-de-partage'
import type { LienDuPerimetre } from '@app/web/features/mediateurs/domain'
import {
  compteSeme,
  rattachementsSemes,
} from '@app/web/features/mediateurs/mediateurs.cucumber'
import { Then, When } from '@cucumber/cucumber'

const roles = {
  médiateur: { perimetre: 'Mediateur', partage: 'mediateur' },
  coordinateur: { perimetre: 'Coordinateur', partage: 'coordinateur' },
} as const

type Role = keyof typeof roles

const estUnRole = (role: string): role is Role => Object.hasOwn(roles, role)

const consultation: { liens: readonly LienDuPerimetre[] } = { liens: [] }

const lienDu = (role: string): LienDuPerimetre => {
  if (!estUnRole(role)) throw new Error(`Rôle inconnu : ${role}`)
  const trouve = consultation.liens.find(
    ({ perimetre }) => perimetre === roles[role].perimetre,
  )
  if (trouve === undefined) throw new Error(`Aucun périmètre ${role} proposé`)
  return trouve
}

const partageSemeDu = (role: string): string | undefined =>
  estUnRole(role) ? compteSeme().partages[roles[role].partage] : undefined

When('ce compte consulte ses liens de partage', async () => {
  consultation.liens = await consulterMesLiensDePartage(rattachementsSemes())
})

Then('le lien du périmètre {word} est celui de son partage', (role: string) => {
  const attendu = partageSemeDu(role)
  assert.notStrictEqual(attendu, undefined)
  assert.strictEqual(lienDu(role).lien, attendu)
})

Then("le périmètre {word} n'a pas de lien", (role: string) => {
  assert.strictEqual(lienDu(role).lien, null)
})

Then("aucun périmètre de partage n'est proposé", () => {
  assert.deepStrictEqual(consultation.liens, [])
})
