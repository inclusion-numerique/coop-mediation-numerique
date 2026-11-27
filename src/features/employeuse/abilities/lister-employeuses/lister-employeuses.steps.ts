import assert from 'node:assert'
import { Page, PageSize, Search, Sort } from '@arckit/resultset'
import { Given, Then, When } from '@cucumber/cucumber'
import type { EmployeuseListee } from '@/features/employeuse/abilities/lister-employeuses/domain/employeuse-listee'
import { listerEmployeuses } from '@/features/employeuse/abilities/lister-employeuses/implementations/prisma/lister-employeuses.query'
import {
  seedAffectation,
  seedEmployeuseMain,
  seedUtilisateur,
} from '@/features/employeuse/employeuse.cucumber'

const employeuses = new Map<string, number>()
const contexte: {
  listees: EmployeuseListee[]
  total: number
  pages: number
} = {
  listees: [],
  total: 0,
  pages: 0,
}

const employeuseListee = (nom: string): EmployeuseListee => {
  const trouvee = contexte.listees.find(
    ({ employeuse }) => employeuse.denomination === nom,
  )
  assert.ok(trouvee, `« ${nom} » ne figure pas dans la page listée`)
  return trouvee
}

Given(
  "l'annuaire contient les employeuses {string}, {string} et {string}",
  async (premiere: string, deuxieme: string, troisieme: string) => {
    employeuses.clear()
    contexte.listees = []
    await [premiere, deuxieme, troisieme].reduce(async (precedente, nom) => {
      await precedente
      employeuses.set(nom, await seedEmployeuseMain(nom))
    }, Promise.resolve())
  },
)

Given(
  '{int} personnes sont rattachées à {string}',
  async (combien: number, nom: string) => {
    const employeuseId = employeuses.get(nom)
    assert.ok(employeuseId, `« ${nom} » n'a pas été enregistrée`)

    await Promise.all(
      Array.from({ length: combien }, async () =>
        seedAffectation({
          userId: await seedUtilisateur(),
          employeuseId,
          source: 'coop',
        }),
      ),
    )
  },
)

const lister = async (recherche: string, parPage: number) => {
  const resultat = await listerEmployeuses({
    recherche: Search(recherche),
    tri: Sort('nom', 'asc'),
    page: Page(1),
    pageSize: PageSize(parPage),
  })
  contexte.listees = resultat.items
  contexte.total = resultat.totalItems
  contexte.pages = Math.max(
    Math.ceil(resultat.totalItems / resultat.pageSize),
    1,
  )
}

When(
  'je liste les employeuses correspondant à {string} par pages de {int}',
  async (recherche: string, parPage: number) => {
    await lister(recherche, parPage)
  },
)

Then('la page listée contient {int} employeuse(s)', (attendu: number) => {
  assert.strictEqual(contexte.listees.length, attendu)
})

Then('le total annoncé est de {int} employeuses', (attendu: number) => {
  assert.strictEqual(contexte.total, attendu)
})

Then('le nombre de pages annoncé est {int}', (attendu: number) => {
  assert.strictEqual(contexte.pages, attendu)
})

Then('la première employeuse listée est {string}', (nom: string) => {
  assert.strictEqual(contexte.listees[0]?.employeuse.denomination, nom)
})

Then(
  '{string} emploie {int} personne(s) dans la liste',
  (nom: string, attendu: number) => {
    assert.strictEqual(employeuseListee(nom).personnesEmployees, attendu)
  },
)
