import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { demandeDeStatistiques } from '../../statistiques.cucumber'
import { type AccompagnementsParTag } from './domain/index'
import { repartirLesAccompagnementsParTag } from './implementations/prisma/accompagnements-par-tag.query'

const etat: {
  parTag?: AccompagnementsParTag
} = {}

When(
  'je répartis les accompagnements de {string} par tag',
  async (nom: string) => {
    etat.parTag = await repartirLesAccompagnementsParTag(
      demandeDeStatistiques(nom),
    )
  },
)

Then('les tags comptés sont {string}', (attendus: string) => {
  assert.ok(etat.parTag, 'Aucune répartition par tag')
  assert.strictEqual(
    etat.parTag.map(({ tag, nombre }) => `${tag.nom} ${nombre}`).join(', '),
    attendus,
  )
})
