import assert from 'node:assert'
import { consulterMesLiensDePartage } from '@app/web/features/mediateurs/abilities/consulter-mes-liens-de-partage'
import type { LienDuPerimetre } from '@app/web/features/mediateurs/domain'
import {
  compteSeme,
  rattachementsSemes,
} from '@app/web/features/mediateurs/mediateurs.cucumber'
import { Then, When } from '@cucumber/cucumber'

type Role = 'mediateur' | 'coordinateur'

const perimetres = {
  mediateur: 'Mediateur',
  coordinateur: 'Coordinateur',
} as const

const consultation: { liens: readonly LienDuPerimetre[] } = { liens: [] }

const lienDu = (role: Role) =>
  consultation.liens.find(({ perimetre }) => perimetre === perimetres[role])

When('ce compte consulte ses liens de partage', async () => {
  consultation.liens = await consulterMesLiensDePartage(rattachementsSemes())
})

Then('le lien du périmètre {word} est celui de son partage', (role: Role) => {
  assert.strictEqual(lienDu(role)?.lien, compteSeme().partages[role])
})

Then("le périmètre {word} n'a pas de lien", (role: Role) => {
  assert.notStrictEqual(lienDu(role), undefined)
  assert.strictEqual(lienDu(role)?.lien, null)
})

Then("aucun périmètre de partage n'est proposé", () => {
  assert.deepStrictEqual(consultation.liens, [])
})
