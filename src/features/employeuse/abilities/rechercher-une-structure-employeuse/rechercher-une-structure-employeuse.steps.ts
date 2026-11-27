import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { seedEmployeuseMain } from '@/features/employeuse/employeuse.cucumber'
import { rechercherEmployeuse } from '@/features/employeuse/implementations/prisma/rechercher-employeuse.query'
import { success } from '@/libraries/result'
import { rechercherUneStructureEmployeuse } from './domain/rechercher-une-structure-employeuse'
import { structuresTrouveesAffichees } from './ui/presenters/structures-trouvees.presenter'

const contexte: {
  proposees: readonly { readonly nom: string; readonly source: string }[]
} = { proposees: [] }

const annuaireSansResultat = async () => success({ structures: [], total: 0 })

Given(
  'une structure employeuse {string} connue de la coop sous le SIRET {string}',
  async (nom: string, siret: string) => {
    await seedEmployeuseMain(nom, siret)
  },
)

When(
  'je cherche la structure employeuse {string}',
  async (recherche: string) => {
    const { data } = await rechercherUneStructureEmployeuse({
      lireLesStructuresDeLaCoop: rechercherEmployeuse,
      lireLAnnuaireDesEntreprises: annuaireSansResultat,
    })({ recherche })
    contexte.proposees = structuresTrouveesAffichees(data).structures
  },
)

Then('la structure {string} est proposée depuis la coop', (nom: string) => {
  assert.ok(
    contexte.proposees.some(
      (structure) => structure.nom === nom && structure.source === 'database',
    ),
    `« ${nom} » n'est pas proposée depuis la coop`,
  )
})

Then("aucune structure n'est proposée", () => {
  assert.deepStrictEqual(contexte.proposees, [])
})
