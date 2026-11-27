import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { demandeDeStatistiques } from '../../statistiques.cucumber'
import { type AccompagnementsParLieu } from './domain/index'
import { compterLesAccompagnementsParLieu } from './implementations/prisma/accompagnements-par-lieu.query'

const etat: {
  parLieu?: AccompagnementsParLieu
} = {}

When(
  'je compte les accompagnements de {string} par lieu',
  async (nom: string) => {
    etat.parLieu = await compterLesAccompagnementsParLieu(
      demandeDeStatistiques(nom),
    )
  },
)

Then('les lieux comptés sont {string}', (attendus: string) => {
  assert.ok(etat.parLieu, 'Aucun compte par lieu')
  assert.strictEqual(
    etat.parLieu.map(({ lieu, nombre }) => `${lieu.nom} ${nombre}`).join(', '),
    attendus,
  )
})
