import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { consulterEmployeuseActuelle } from '@/features/employeuse/abilities/consulter-employeuse-actuelle/implementations/prisma/consulter-employeuse-actuelle.query'
import type { EmployeuseActuelle } from '@/features/employeuse/domain/consultation/employeuse-actuelle'
import {
  seedAffectation,
  seedContrat,
  seedEmployeuseMain,
  seedUtilisateur,
} from '@/features/employeuse/employeuse.cucumber'

const contexte: {
  utilisateurId: string
  employeuseCourante: EmployeuseActuelle | null
} = {
  utilisateurId: '',
  employeuseCourante: null,
}

const employeusesParNom = new Map<string, number>()

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
    contexte.utilisateurId = await seedUtilisateur()
    await seedAffectation({
      userId: contexte.utilisateurId,
      employeuseId: await employeuseNommee(nom),
      source,
    })
  },
)

Given(
  'ce même utilisateur affecté à {string} par la source {string}',
  async (nom: string, source: string) => {
    await seedAffectation({
      userId: contexte.utilisateurId,
      employeuseId: await employeuseNommee(nom),
      source,
    })
  },
)

Given(
  'ce même utilisateur affecté à {string} par la source {string} le {string}',
  async (nom: string, source: string, date: string) => {
    await seedAffectation({
      userId: contexte.utilisateurId,
      employeuseId: await employeuseNommee(nom),
      source,
      enregistreeLe: new Date(date),
    })
  },
)

Given(
  'ce même utilisateur anciennement affecté à {string} par la source {string}',
  async (nom: string, source: string) => {
    await seedAffectation({
      userId: contexte.utilisateurId,
      employeuseId: await employeuseNommee(nom),
      source,
      active: false,
    })
  },
)

Given('un utilisateur sans affectation', async () => {
  employeusesParNom.clear()
  contexte.utilisateurId = await seedUtilisateur()
})

Given(
  'un contrat chez {string} débuté le {string}',
  async (nom: string, debut: string) => {
    await seedContrat({
      userId: contexte.utilisateurId,
      employeuseId: await employeuseNommee(nom),
      debut: new Date(debut),
      fin: null,
    })
  },
)

Given(
  'un contrat chez {string} courant du {string} au {string}',
  async (nom: string, debut: string, fin: string) => {
    await seedContrat({
      userId: contexte.utilisateurId,
      employeuseId: await employeuseNommee(nom),
      debut: new Date(debut),
      fin: new Date(fin),
    })
  },
)

When("je consulte l'employeuse courante de cet utilisateur", async () => {
  contexte.employeuseCourante = await consulterEmployeuseActuelle({
    userId: contexte.utilisateurId,
  })
})

Then("l'employeuse courante est {string}", (nom: string) => {
  assert.ok(contexte.employeuseCourante, 'Aucune employeuse courante')
  assert.strictEqual(contexte.employeuseCourante.employeuse.denomination, nom)
})

Then("cet utilisateur n'a pas d'employeuse courante", () => {
  assert.strictEqual(contexte.employeuseCourante, null)
})

Then("la période d'emploi est en cours depuis le {string}", (debut: string) => {
  assert.ok(contexte.employeuseCourante, 'Aucune employeuse courante')
  assert.deepStrictEqual(contexte.employeuseCourante.periode, {
    _tag: 'enCours',
    debut: new Date(debut),
    finPrevue: null,
  })
})

Then(
  "la période d'emploi est en cours depuis le {string} jusqu'au {string}",
  (debut: string, fin: string) => {
    assert.ok(contexte.employeuseCourante, 'Aucune employeuse courante')
    assert.deepStrictEqual(contexte.employeuseCourante.periode, {
      _tag: 'enCours',
      debut: new Date(debut),
      finPrevue: new Date(fin),
    })
  },
)

Then("la période d'emploi est terminée le {string}", (fin: string) => {
  assert.ok(contexte.employeuseCourante, 'Aucune employeuse courante')
  assert.strictEqual(contexte.employeuseCourante.periode._tag, 'terminee')
  assert.deepStrictEqual(
    contexte.employeuseCourante.periode._tag === 'terminee'
      ? contexte.employeuseCourante.periode.fin
      : null,
    new Date(fin),
  )
})

Then("la période d'emploi est inconnue", () => {
  assert.ok(contexte.employeuseCourante, 'Aucune employeuse courante')
  assert.deepStrictEqual(contexte.employeuseCourante.periode, {
    _tag: 'inconnue',
  })
})
