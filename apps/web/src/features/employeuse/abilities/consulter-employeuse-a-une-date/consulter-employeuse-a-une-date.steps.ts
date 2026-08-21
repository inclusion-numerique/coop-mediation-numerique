import assert from 'node:assert'
import { consulterEmployeuseAUneDate } from '@app/web/features/employeuse/abilities/consulter-employeuse-a-une-date/implementation'
import type { Employeuse } from '@app/web/features/employeuse/domain/employeuse'
import {
  seedAffectation,
  seedContrat,
  seedEmployeuseMain,
  seedUtilisateur,
} from '@app/web/features/employeuse/employeuse.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

// État local à cette ability : les phrasés Cucumber sont globaux, et une ability
// ne s'appuie pas sur les steps d'une autre (duplication découplée assumée).
let utilisateurId: string
const employeusesParNom = new Map<string, number>()
let employeuseALaDate: Employeuse | null = null

const employeuseNommee = async (nom: string): Promise<number> => {
  const existante = employeusesParNom.get(nom)
  if (existante) return existante

  const employeuseId = await seedEmployeuseMain(nom)
  employeusesParNom.set(nom, employeuseId)
  return employeuseId
}

const nouvelUtilisateur = async (): Promise<void> => {
  employeusesParNom.clear()
  utilisateurId = await seedUtilisateur()
}

Given(
  'un utilisateur employé par {string} du {string} au {string}',
  async (nom: string, debut: string, fin: string) => {
    await nouvelUtilisateur()
    await seedContrat({
      userId: utilisateurId,
      employeuseId: await employeuseNommee(nom),
      debut: new Date(debut),
      fin: new Date(fin),
    })
  },
)

Given(
  'un utilisateur employé par {string} depuis le {string}',
  async (nom: string, debut: string) => {
    await nouvelUtilisateur()
    await seedContrat({
      userId: utilisateurId,
      employeuseId: await employeuseNommee(nom),
      debut: new Date(debut),
      fin: null,
    })
  },
)

Given(
  'ce même utilisateur employé par {string} depuis le {string}',
  async (nom: string, debut: string) => {
    await seedContrat({
      userId: utilisateurId,
      employeuseId: await employeuseNommee(nom),
      debut: new Date(debut),
      fin: null,
    })
  },
)

Given(
  'ce même utilisateur employé par {string} du {string} au {string}',
  async (nom: string, debut: string, fin: string) => {
    await seedContrat({
      userId: utilisateurId,
      employeuseId: await employeuseNommee(nom),
      debut: new Date(debut),
      fin: new Date(fin),
    })
  },
)

Given(
  'un utilisateur avec une affectation active chez {string}',
  async (nom: string) => {
    await nouvelUtilisateur()
    await seedAffectation({
      userId: utilisateurId,
      employeuseId: await employeuseNommee(nom),
      source: 'coop',
    })
  },
)

Given('un utilisateur sans employeuse connue', async () => {
  await nouvelUtilisateur()
})

When('je consulte son employeuse au {string}', async (date: string) => {
  employeuseALaDate = await consulterEmployeuseAUneDate({
    userId: utilisateurId,
    date: new Date(date),
  })
})

Then("l'employeuse à cette date est {string}", (nom: string) => {
  assert.ok(employeuseALaDate, 'Aucune employeuse à cette date')
  assert.strictEqual(employeuseALaDate.denomination, nom)
})

Then("il n'a pas d'employeuse à cette date", () => {
  assert.strictEqual(employeuseALaDate, null)
})
