import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { Jour } from '../../domain'
import { demandeDeStatistiques } from '../../statistiques.cucumber'
import {
  type AccompagnementsParPeriode,
  compterLesAccompagnementsParPeriode,
  fenetreDe,
} from '.'

let parPeriode: AccompagnementsParPeriode | undefined

const comptes = (): AccompagnementsParPeriode => {
  assert.ok(parPeriode, 'Aucun compte par période')
  return parPeriode
}

const compter = async (nom: string, debut: Jour | null, fin: Jour) => {
  const fenetre = fenetreDe({ debut, fin })
  parPeriode = await compterLesAccompagnementsParPeriode({
    ...demandeDeStatistiques(nom),
    parJour: fenetre,
    parMois: fenetre,
  })
}

When(
  'je compte les accompagnements de {string} par période du {string} au {string}',
  async (nom: string, du: string, au: string) => {
    await compter(nom, Jour(du), Jour(au))
  },
)

When(
  "je compte les accompagnements de {string} par période jusqu'au {string}",
  async (nom: string, au: string) => {
    await compter(nom, null, Jour(au))
  },
)

Then('les accompagnements par mois sont {string}', (attendus: string) => {
  assert.strictEqual(
    comptes()
      .parMois.map(({ mois, nombre }) => `${mois} ${nombre}`)
      .join(', '),
    attendus,
  )
})

Then(
  'les accompagnements du jour {string} sont {int}',
  (jour: string, nombre: number) => {
    assert.strictEqual(
      comptes().parJour.find((ligne) => ligne.jour === jour)?.nombre,
      nombre,
    )
  },
)

Then(
  'les accompagnements du mois {string} sont {int}',
  (mois: string, nombre: number) => {
    assert.strictEqual(
      comptes().parMois.find((ligne) => ligne.mois === mois)?.nombre,
      nombre,
    )
  },
)

Then('la série par jour compte {int} jours', (jours: number) => {
  assert.strictEqual(comptes().parJour.length, jours)
})

Then(
  'la série par mois va de {string} à {string}',
  (premier: string, dernier: string) => {
    assert.deepStrictEqual(
      [comptes().parMois.at(0)?.mois, comptes().parMois.at(-1)?.mois],
      [premier, dernier],
    )
  },
)

Then("aucun accompagnement n'est compté par période", () => {
  assert.ok(
    [...comptes().parJour, ...comptes().parMois].every(
      ({ nombre }) => nombre === 0,
    ),
  )
})
