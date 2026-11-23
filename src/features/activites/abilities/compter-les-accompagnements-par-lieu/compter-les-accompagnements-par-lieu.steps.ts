import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { demandeDeStatistiques } from '../../statistiques.cucumber'
import { type AccompagnementsParLieu } from './domain/index'
import { compterLesAccompagnementsParLieu } from './implementations/prisma/accompagnements-par-lieu.query'

let parLieu: AccompagnementsParLieu | undefined

When(
  'je compte les accompagnements de {string} par lieu',
  async (nom: string) => {
    parLieu = await compterLesAccompagnementsParLieu(demandeDeStatistiques(nom))
  },
)

Then('les lieux comptés sont {string}', (attendus: string) => {
  assert.ok(parLieu, 'Aucun compte par lieu')
  assert.strictEqual(
    parLieu.map(({ lieu, nombre }) => `${lieu.nom} ${nombre}`).join(', '),
    attendus,
  )
})
