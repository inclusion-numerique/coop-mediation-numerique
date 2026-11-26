import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import type { EmployeuseConsultee } from '@/features/employeuse/abilities/consulter-employeuse/domain/employeuse-consultee'
import { consulterEmployeuse } from '@/features/employeuse/abilities/consulter-employeuse/implementations/prisma/consulter-employeuse.query'
import { EmployeuseId } from '@/features/employeuse/domain/employeuse-id'
import {
  desactiverAffectations,
  seedAffectation,
  seedEmployeuseMain,
  seedUtilisateur,
  supprimerEmployeuseMain,
} from '@/features/employeuse/employeuse.cucumber'

const employeuses = new Map<string, number>()
const contexte: {
  fiche: EmployeuseConsultee | null
} = {
  fiche: null,
}

const employeuseId = (nom: string): number => {
  const id = employeuses.get(nom)
  assert.ok(id, `« ${nom} » n'a pas été enregistrée`)
  return id
}

const enregistrer = async (nom: string, personnes: number) => {
  employeuses.set(nom, await seedEmployeuseMain(nom))
  await Promise.all(
    Array.from({ length: personnes }, async () =>
      seedAffectation({
        userId: await seedUtilisateur(),
        employeuseId: employeuseId(nom),
        source: 'coop',
      }),
    ),
  )
}

Given(
  "l'employeuse {string} existe avec {int} personne(s) rattachée(s)",
  async (nom: string, personnes: number) => {
    await enregistrer(nom, personnes)
  },
)

Given(
  "l'employeuse {string} existe sans personne rattachée",
  async (nom: string) => {
    await enregistrer(nom, 0)
  },
)

Given(
  "l'employeuse {string} existe avec 1 personne rattachée par {int} sources",
  async (nom: string, sources: number) => {
    employeuses.set(nom, await seedEmployeuseMain(nom))
    const userId = await seedUtilisateur()
    await (['coop', 'idposte', 'aidants-connect'] as const)
      .slice(0, sources)
      .reduce(
        (precedentes, source) =>
          precedentes.then(async () => {
            await seedAffectation({
              userId,
              employeuseId: employeuseId(nom),
              source,
            })
          }),
        Promise.resolve(),
      )
  },
)

Given('le rattachement à {string} est terminé', async (nom: string) => {
  await desactiverAffectations(employeuseId(nom))
})

Given("l'employeuse {string} a été supprimée", async (nom: string) => {
  await supprimerEmployeuseMain(employeuseId(nom))
})

When('je consulte la fiche de {string}', async (nom: string) => {
  contexte.fiche = await consulterEmployeuse({
    employeuseId: EmployeuseId(employeuseId(nom)),
  })
})

Then('la fiche porte le nom {string}', (nom: string) => {
  assert.ok(contexte.fiche, 'Aucune fiche')
  assert.strictEqual(contexte.fiche.employeuse.denomination, nom)
})

Then('la fiche compte {int} personne(s) employée(s)', (attendu: number) => {
  assert.ok(contexte.fiche, 'Aucune fiche')
  assert.strictEqual(contexte.fiche.personnesEmployees.length, attendu)
})

Then("aucune fiche n'est trouvée", () => {
  assert.strictEqual(contexte.fiche, null)
})
