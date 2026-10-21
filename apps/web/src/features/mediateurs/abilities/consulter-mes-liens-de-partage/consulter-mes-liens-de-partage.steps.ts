import assert from 'node:assert'
import { consulterMonLienDePartage } from '@app/web/features/mediateurs/abilities/consulter-mon-lien-de-partage'
import type { LienDePartageId } from '@app/web/features/mediateurs/domain'
import {
  compteSeme,
  rattachementsSemes,
} from '@app/web/features/mediateurs/mediateurs.cucumber'
import { Then, When } from '@cucumber/cucumber'

const consultation: { lien?: LienDePartageId | null } = {}

When('ce compte consulte son lien de partage', async () => {
  consultation.lien = await consulterMonLienDePartage(rattachementsSemes())
})

Then('le lien consulté est celui du partage', () => {
  const [partage] = Object.values(compteSeme().partages)
  assert.strictEqual(consultation.lien, partage)
})

Then('le lien consulté est celui du partage du médiateur', () => {
  assert.strictEqual(consultation.lien, compteSeme().partages.mediateur)
})

Then("aucun lien n'est consulté", () => {
  assert.strictEqual(consultation.lien, null)
})
