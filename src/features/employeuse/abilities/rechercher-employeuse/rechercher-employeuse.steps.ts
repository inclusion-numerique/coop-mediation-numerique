import assert from 'node:assert'
import { rechercherEmployeuse } from '@app/web/features/employeuse/abilities/rechercher-employeuse/implementation'
import type { Employeuse } from '@app/web/features/employeuse/domain/employeuse'
import {
  seedEmployeuseMain,
  supprimerEmployeuseMain,
} from '@app/web/features/employeuse/employeuse.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

let trouvees: Employeuse[] = []

const nomsTrouves = (): (string | null)[] =>
  trouvees.map(({ denomination }) => denomination)

Given(
  "l'employeuse {string} est enregistrée sous le SIRET {string}",
  async (nom: string, siret: string) => {
    await seedEmployeuseMain(nom, siret)
  },
)

Given(
  "l'employeuse {string} est enregistrée puis supprimée",
  async (nom: string) => {
    await supprimerEmployeuseMain(await seedEmployeuseMain(nom))
  },
)

When("je recherche l'employeuse {string}", async (recherche: string) => {
  const resultat = await rechercherEmployeuse({ recherche })
  trouvees = resultat.employeuses
})

Then('la recherche trouve {string}', (nom: string) => {
  assert.ok(
    nomsTrouves().includes(nom),
    `« ${nom} » absent des résultats : ${nomsTrouves().join(', ')}`,
  )
})

Then('la recherche ne trouve pas {string}', (nom: string) => {
  assert.ok(!nomsTrouves().includes(nom), `« ${nom} » n'aurait pas dû sortir`)
})

Then('la recherche ne trouve rien', () => {
  assert.deepStrictEqual(trouvees, [])
})
