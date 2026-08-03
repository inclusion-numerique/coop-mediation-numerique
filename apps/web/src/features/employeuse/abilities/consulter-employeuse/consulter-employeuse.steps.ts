import assert from 'node:assert'
import type { EmployeuseConsultee } from '@app/web/features/employeuse/abilities/consulter-employeuse/domain/consulter-employeuse'
import { consulterEmployeuse } from '@app/web/features/employeuse/abilities/consulter-employeuse/implementation'
import { EmployeuseId } from '@app/web/features/employeuse/domain/employeuse-id'
import {
  desactiverAffectations,
  seedAffectation,
  seedEmployeuseMain,
  seedUtilisateur,
  supprimerEmployeuseMain,
} from '@app/web/features/employeuse/employeuse.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

const employeuses = new Map<string, number>()
let fiche: EmployeuseConsultee | null = null

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

Given('le rattachement à {string} est terminé', async (nom: string) => {
  await desactiverAffectations(employeuseId(nom))
})

Given("l'employeuse {string} a été supprimée", async (nom: string) => {
  await supprimerEmployeuseMain(employeuseId(nom))
})

When('je consulte la fiche de {string}', async (nom: string) => {
  fiche = await consulterEmployeuse({
    employeuseId: EmployeuseId(employeuseId(nom)),
  })
})

Then('la fiche porte le nom {string}', (nom: string) => {
  assert.ok(fiche, 'Aucune fiche')
  assert.strictEqual(fiche.employeuse.denomination, nom)
})

Then('la fiche compte {int} personne(s) employée(s)', (attendu: number) => {
  assert.ok(fiche, 'Aucune fiche')
  assert.strictEqual(fiche.personnesEmployees.length, attendu)
})

Then("aucune fiche n'est trouvée", () => {
  assert.strictEqual(fiche, null)
})
