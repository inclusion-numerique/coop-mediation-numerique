import assert from 'node:assert'
import {
  type BeneficiaireSortField,
  beneficiaireSortFields,
} from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/domain/lister-beneficiaires'
import { listerBeneficiaires } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/implementation'
import {
  seedBeneficiaire,
  testMediateurId,
} from '@app/web/features/beneficiaire/beneficiaire.cucumber'
import { PageSize, Search, Sort, SortDirection } from '@arckit/resultset'
import { type DataTable, Given, Then, When } from '@cucumber/cucumber'

type ListResult = Awaited<ReturnType<typeof listerBeneficiaires>>

let listResult: ListResult | undefined

const toSortField = (value: string): BeneficiaireSortField => {
  const field = beneficiaireSortFields.find((candidate) => candidate === value)
  if (!field) throw new Error(`Champ de tri inconnu : ${value}`)
  return field
}

Given(
  'les bénéficiaires suivants pour ce médiateur',
  async (dataTable: DataTable) => {
    await Promise.all(
      dataTable
        .hashes()
        .map(({ prenom, nom }) => seedBeneficiaire({ prenom, nom })),
    )
  },
)

When(
  'je liste les bénéficiaires avec la recherche {string}',
  async (recherche: string) => {
    listResult = await listerBeneficiaires({
      mediateurId: testMediateurId,
      search: Search(recherche),
    })
  },
)

When(
  'je liste les bénéficiaires avec la recherche {string} par pages de {int}',
  async (recherche: string, pageSize: number) => {
    listResult = await listerBeneficiaires({
      mediateurId: testMediateurId,
      search: Search(recherche),
      pageSize: PageSize(pageSize),
    })
  },
)

When(
  'je liste les bénéficiaires triés par {string} en {string}',
  async (field: string, direction: string) => {
    listResult = await listerBeneficiaires({
      mediateurId: testMediateurId,
      sort: Sort(toSortField(field), SortDirection(direction)),
    })
  },
)

Then('la liste contient {int} bénéficiaire(s)', (count: number) => {
  assert.strictEqual(listResult?.items.length, count)
})

Then('le premier bénéficiaire est {string}', (nom: string) => {
  assert.strictEqual(listResult?.items[0]?.nom, nom)
})

Then('le nombre total de correspondances est {int}', (count: number) => {
  assert.strictEqual(listResult?.totalItems, count)
})

Then('le nombre de pages est {int}', (count: number) => {
  assert.ok(listResult)
  const totalPages = Math.ceil(listResult.totalItems / listResult.pageSize)
  assert.strictEqual(totalPages, count)
})
