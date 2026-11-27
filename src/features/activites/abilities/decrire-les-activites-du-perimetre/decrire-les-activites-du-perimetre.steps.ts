import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { perimetreDe } from '../../statistiques.cucumber'
import { type ActivitesDuPerimetre } from './domain/index'
import { decrireLesActivitesDuPerimetre } from './implementations/prisma/activites-du-perimetre.query'

const etat: {
  decrites?: ActivitesDuPerimetre
} = {}

const activites = (): ActivitesDuPerimetre => {
  assert.ok(etat.decrites, 'Aucune description du périmètre')
  return etat.decrites
}

When(
  'je décris les activités du périmètre de {string}',
  async (nom: string) => {
    etat.decrites = await decrireLesActivitesDuPerimetre(perimetreDe(nom))
  },
)

Then('les employeuses du périmètre sont {string}', (attendues: string) => {
  assert.strictEqual(
    activites()
      .employeuses.map(({ nom }) => nom)
      .join(', '),
    attendues,
  )
})

Then(
  'les activités couvrent du {string} au {string}',
  (premiere: string, derniere: string) => {
    assert.deepStrictEqual(
      [activites().premiere, activites().derniere],
      [premiere, derniere],
    )
  },
)

Then("le périmètre n'a aucune employeuse", () => {
  assert.deepStrictEqual(activites().employeuses, [])
})
