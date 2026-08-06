import assert from 'node:assert'
import { consulterHistoriqueEmployeuses } from '@app/web/features/employeuse/abilities/consulter-historique-employeuses/implementation'
import type { EmployeuseHistorique } from '@app/web/features/employeuse/domain/employeuses-historique'
import {
  seedAffectation,
  seedContrat,
  seedEmployeuseMain,
  seedUtilisateur,
} from '@app/web/features/employeuse/employeuse.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

// État local à cette ability (les phrasés Cucumber sont globaux, et une ability
// ne s'appuie pas sur les steps d'une autre).
let compteId: string
const employeusesParNom = new Map<string, number>()
let historique: EmployeuseHistorique[] = []

const employeuseNommee = async (nom: string): Promise<number> => {
  const existante = employeusesParNom.get(nom)
  if (existante) return existante

  const employeuseId = await seedEmployeuseMain(nom)
  employeusesParNom.set(nom, employeuseId)
  return employeuseId
}

const entree = (nom: string): EmployeuseHistorique => {
  const trouvee = historique.find(
    ({ employeuse }) => employeuse.denomination === nom,
  )
  assert.ok(trouvee, `« ${nom} » ne figure pas dans l'historique`)
  return trouvee
}

// Deux rattachements distincts sur la même employeuse ne peuvent pas partager la
// source (clé d'unicité en base) : on varie la source à chaque appel.
const rattacher = async (nom: string, active: boolean, source: string) => {
  await seedAffectation({
    userId: compteId,
    employeuseId: await employeuseNommee(nom),
    source,
    active,
  })
}

const nouveauCompte = async (): Promise<void> => {
  employeusesParNom.clear()
  historique = []
  compteId = await seedUtilisateur()
}

Given(
  'un compte rattaché à {string} par une affectation active',
  async (nom: string) => {
    await nouveauCompte()
    await rattacher(nom, true, 'coop')
  },
)

Given(
  'ce compte rattaché à {string} par une affectation terminée',
  async (nom: string) => {
    await rattacher(nom, false, 'coop')
  },
)

Given(
  'ce compte rattaché une seconde fois à {string} par une affectation terminée',
  async (nom: string) => {
    await rattacher(nom, false, 'idposte')
  },
)

Given('un compte sans aucun rattachement', async () => {
  await nouveauCompte()
})

Given(
  'un contrat chez {string} du {string} au {string}',
  async (nom: string, debut: string, fin: string) => {
    await seedContrat({
      userId: compteId,
      employeuseId: await employeuseNommee(nom),
      debut: new Date(debut),
      fin: new Date(fin),
    })
  },
)

When("je consulte l'historique de ses employeuses", async () => {
  historique = await consulterHistoriqueEmployeuses({ userId: compteId })
})

Then("l'historique compte {int} employeuse(s)", (attendu: number) => {
  assert.strictEqual(historique.length, attendu)
})

Then("l'historique est vide", () => {
  assert.deepStrictEqual(historique, [])
})

Then('{string} y figure comme rattachement actif', (nom: string) => {
  assert.strictEqual(entree(nom).affectationActive, true)
})

Then('{string} y figure comme rattachement terminé', (nom: string) => {
  assert.strictEqual(entree(nom).affectationActive, false)
})

Then(
  'la période de {string} va du {string} au {string}',
  (nom: string, debut: string, fin: string) => {
    assert.deepStrictEqual(entree(nom).periode, {
      _tag: 'terminee',
      debut: new Date(debut),
      fin: new Date(fin),
    })
  },
)

Then('la période de {string} est inconnue', (nom: string) => {
  assert.deepStrictEqual(entree(nom).periode, { _tag: 'inconnue' })
})
