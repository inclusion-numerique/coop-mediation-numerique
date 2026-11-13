import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { demandeDeStatistiques } from '../../statistiques.cucumber'
import { type AccompagnementsParTag, repartirLesAccompagnementsParTag } from '.'

let parTag: AccompagnementsParTag | undefined

When(
  'je répartis les accompagnements de {string} par tag',
  async (nom: string) => {
    parTag = await repartirLesAccompagnementsParTag(demandeDeStatistiques(nom))
  },
)

Then('les tags comptés sont {string}', (attendus: string) => {
  assert.ok(parTag, 'Aucune répartition par tag')
  assert.strictEqual(
    parTag.map(({ tag, nombre }) => `${tag.nom} ${nombre}`).join(', '),
    attendus,
  )
})
