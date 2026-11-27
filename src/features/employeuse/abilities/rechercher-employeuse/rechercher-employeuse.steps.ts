import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { rechercherDesCommunesDesEmployeuses } from '@/features/employeuse/abilities/rechercher-employeuse/implementations/prisma/communes-des-employeuses.query'
import type { Employeuse } from '@/features/employeuse/domain/employeuse'
import {
  seedEmployeuseMain,
  supprimerEmployeuseMain,
} from '@/features/employeuse/employeuse.cucumber'
import { rechercherEmployeuse } from '@/features/employeuse/implementations/prisma/rechercher-employeuse.query'

const contexte: {
  trouvees: readonly Employeuse[]
} = {
  trouvees: [],
}

const nomsTrouves = (): (string | null)[] =>
  contexte.trouvees.map(({ denomination }) => denomination)

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
  const resultat = await rechercherEmployeuse({ recherche, limite: 50 })
  contexte.trouvees = resultat.employeuses
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
  assert.deepStrictEqual(contexte.trouvees, [])
})

const communes: { semees: readonly number[]; proposees: readonly string[] } = {
  semees: [],
  proposees: [],
}

Given(
  "une adresse d'employeuse à {string} au code INSEE {string} et au code postal {string}",
  async (nomCommune: string, codeInsee: string, codePostal: string) => {
    const { id } = await prismaClient.adresseMain.create({
      data: { nomCommune, codeInsee, codePostal, nomVoie: v4() },
      select: { id: true },
    })
    communes.semees = [...communes.semees, id]
  },
)

When('je cherche la commune {string}', async (recherche: string) => {
  communes.proposees = (
    await rechercherDesCommunesDesEmployeuses({ recherche, limite: 20 })
  ).map(({ codeInsee }) => codeInsee)
})

Then('la commune de code INSEE {string} est proposée', (codeInsee: string) => {
  assert.ok(
    communes.proposees.includes(codeInsee),
    `« ${codeInsee} » absent des résultats : ${communes.proposees.join(', ')}`,
  )
})

After(async () => {
  const aSupprimer = communes.semees
  communes.semees = []
  communes.proposees = []
  if (aSupprimer.length === 0) return
  await prismaClient.adresseMain.deleteMany({
    where: { id: { in: [...aSupprimer] } },
  })
})
