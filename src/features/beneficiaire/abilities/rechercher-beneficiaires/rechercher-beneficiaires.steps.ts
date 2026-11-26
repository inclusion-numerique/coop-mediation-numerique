import assert from 'node:assert'
import { type DataTable, Given, Then, When } from '@cucumber/cucumber'
import { rechercherBeneficiaires } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/implementations/prisma/rechercher-beneficiaires.query'
import {
  seedBeneficiaire,
  testMediateurId,
} from '@/features/beneficiaire/beneficiaire.cucumber'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'

type SearchResult = Awaited<ReturnType<typeof rechercherBeneficiaires>>

const contexte: {
  seededIds: string[]
  searchResult?: SearchResult | undefined
} = { seededIds: [] }

Given(
  'les bénéficiaires de recherche suivants',
  async (dataTable: DataTable) => {
    contexte.seededIds = await Promise.all(
      dataTable.hashes().map(({ prenom, nom }) =>
        seedBeneficiaire({
          ...(prenom === undefined ? {} : { prenom }),
          ...(nom === undefined ? {} : { nom }),
        }),
      ),
    )
  },
)

When('je recherche {string}', async (query: string) => {
  contexte.searchResult = await rechercherBeneficiaires({
    mediateurId: testMediateurId,
    query,
  })
})

When('je recherche {string} en excluant le premier', async (query: string) => {
  contexte.searchResult = await rechercherBeneficiaires({
    mediateurId: testMediateurId,
    query,
    excludeIds: [BeneficiaireId(contexte.seededIds[0] ?? '')],
  })
})

Then('la recherche retourne {int} bénéficiaire(s)', (count: number) => {
  assert.strictEqual(contexte.searchResult?.beneficiaires.length, count)
})
