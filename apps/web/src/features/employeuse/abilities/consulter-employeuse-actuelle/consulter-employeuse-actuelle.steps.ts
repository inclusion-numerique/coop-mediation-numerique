import assert from 'node:assert'
import { consulterEmployeuseActuelle } from '@app/web/features/employeuse/abilities/consulter-employeuse-actuelle/implementation'
import type { EmployeuseActuelle } from '@app/web/features/employeuse/domain/employeuse-actuelle'
import {
  seedAffectation,
  seedContrat,
  seedEmployeuseMain,
  seedUtilisateur,
} from '@app/web/features/employeuse/employeuse.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

let utilisateurId: string
const employeusesParNom = new Map<string, number>()
let employeuseCourante: EmployeuseActuelle | null = null

const employeuseNommee = async (nom: string): Promise<number> => {
  const existante = employeusesParNom.get(nom)
  if (existante) return existante

  const employeuseId = await seedEmployeuseMain(nom)
  employeusesParNom.set(nom, employeuseId)
  return employeuseId
}

Given(
  'un utilisateur affecté à {string} par la source {string}',
  async (nom: string, source: string) => {
    employeusesParNom.clear()
    utilisateurId = await seedUtilisateur()
    await seedAffectation({
      userId: utilisateurId,
      employeuseId: await employeuseNommee(nom),
      source,
    })
  },
)

Given(
  'ce même utilisateur affecté à {string} par la source {string}',
  async (nom: string, source: string) => {
    await seedAffectation({
      userId: utilisateurId,
      employeuseId: await employeuseNommee(nom),
      source,
    })
  },
)

Given('un utilisateur sans affectation', async () => {
  employeusesParNom.clear()
  utilisateurId = await seedUtilisateur()
})

Given(
  'un contrat chez {string} débuté le {string}',
  async (nom: string, debut: string) => {
    await seedContrat({
      userId: utilisateurId,
      employeuseId: await employeuseNommee(nom),
      debut: new Date(debut),
      fin: null,
    })
  },
)

When("je consulte l'employeuse courante de cet utilisateur", async () => {
  employeuseCourante = await consulterEmployeuseActuelle({
    userId: utilisateurId,
  })
})

Then("l'employeuse courante est {string}", (nom: string) => {
  assert.ok(employeuseCourante, 'Aucune employeuse courante')
  assert.strictEqual(employeuseCourante.employeuse.denomination, nom)
})

Then("cet utilisateur n'a pas d'employeuse courante", () => {
  assert.strictEqual(employeuseCourante, null)
})

Then("la période d'emploi est en cours depuis le {string}", (debut: string) => {
  assert.ok(employeuseCourante, 'Aucune employeuse courante')
  assert.deepStrictEqual(employeuseCourante.periode, {
    _tag: 'enCours',
    debut: new Date(debut),
  })
})

Then("la période d'emploi est inconnue", () => {
  assert.ok(employeuseCourante, 'Aucune employeuse courante')
  assert.deepStrictEqual(employeuseCourante.periode, { _tag: 'inconnue' })
})
