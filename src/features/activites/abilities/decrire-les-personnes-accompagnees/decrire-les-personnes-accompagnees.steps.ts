import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import type { Repartition } from '../../domain'
import { demandeDeStatistiques } from '../../statistiques.cucumber'
import {
  decrireLesPersonnesAccompagnees,
  type ProfilDesPersonnesAccompagnees,
} from '.'

let profil: ProfilDesPersonnesAccompagnees | undefined

const decrites = (): ProfilDesPersonnesAccompagnees => {
  assert.ok(profil, 'Aucun profil')
  return profil
}

const enTexte = (lignes: Repartition<string>): string =>
  lignes.map(({ valeur, nombre }) => `${valeur} ${nombre}`).join(', ')

When(
  'je décris les personnes accompagnées par {string}',
  async (nom: string) => {
    profil = await decrireLesPersonnesAccompagnees(demandeDeStatistiques(nom))
  },
)

Then('les personnes décrites sont {int}', (total: number) => {
  assert.strictEqual(decrites().total, total)
})

Then('la répartition par genre est {string}', (attendue: string) => {
  assert.strictEqual(enTexte(decrites().genres), attendue)
})

Then('la répartition par statut social est {string}', (attendue: string) => {
  assert.strictEqual(enTexte(decrites().statutsSociaux), attendue)
})

Then(
  'la tranche {string} compte {int} personne',
  (tranche: string, nombre: number) => {
    assert.strictEqual(
      decrites().tranchesDAge.find(({ valeur }) => valeur === tranche)?.nombre,
      nombre,
    )
  },
)
