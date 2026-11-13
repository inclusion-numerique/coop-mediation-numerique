import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import type { Repartition } from '../../domain'
import { demandeDeStatistiques } from '../../statistiques.cucumber'
import {
  type RepartitionDesAccompagnements,
  repartirLesAccompagnements,
} from '.'

let repartition: RepartitionDesAccompagnements | undefined

const repartie = (): RepartitionDesAccompagnements => {
  assert.ok(repartition, 'Aucune répartition')
  return repartition
}

const enTexte = (lignes: Repartition<string>): string =>
  lignes.map(({ valeur, nombre }) => `${valeur} ${nombre}`).join(', ')

When('je répartis les accompagnements de {string}', async (nom: string) => {
  repartition = await repartirLesAccompagnements(demandeDeStatistiques(nom))
})

Then('les accompagnements répartis sont {int}', (total: number) => {
  assert.strictEqual(repartie().total, total)
})

Then('la répartition par type est {string}', (attendue: string) => {
  assert.strictEqual(enTexte(repartie().types), attendue)
})

Then('la répartition par durée est {string}', (attendue: string) => {
  assert.strictEqual(enTexte(repartie().durees), attendue)
})

Then('la répartition par type de lieu est {string}', (attendue: string) => {
  assert.strictEqual(enTexte(repartie().typesDeLieu), attendue)
})

Then('la répartition par matériel est {string}', (attendue: string) => {
  assert.strictEqual(enTexte(repartie().materiels), attendue)
})

Then(
  'la thématique {string} compte {int} accompagnements',
  (thematique: string, nombre: number) => {
    assert.strictEqual(
      repartie().thematiques.find(({ valeur }) => valeur === thematique)
        ?.nombre,
      nombre,
    )
  },
)
