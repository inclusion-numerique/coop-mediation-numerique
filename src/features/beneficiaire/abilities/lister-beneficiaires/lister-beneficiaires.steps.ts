import assert from 'node:assert'
import { PageSize, Search, Sort, SortDirection } from '@arckit/resultset'
import { type DataTable, Given, Then, When } from '@cucumber/cucumber'
import type { ColonneTriableDesBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/domain/liste-des-beneficiaires'
import { listerBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/implementations/prisma/lister-beneficiaires.query'
import { colonnesTriablesDesBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/ui/filtres/liste-des-beneficiaires.filtre'
import {
  seedBeneficiaire,
  testMediateurId,
} from '@/features/beneficiaire/beneficiaire.cucumber'

type ListResult = Awaited<ReturnType<typeof listerBeneficiaires>>

const contexte: {
  listResult?: ListResult | undefined
} = {}

const toSortField = (value: string): ColonneTriableDesBeneficiaires => {
  const field = colonnesTriablesDesBeneficiaires.find(
    (candidate) => candidate === value,
  )
  if (!field) throw new Error(`Champ de tri inconnu : ${value}`)
  return field
}

Given(
  'les bénéficiaires suivants pour ce médiateur',
  async (dataTable: DataTable) => {
    await Promise.all(
      dataTable.hashes().map(({ prenom, nom }) =>
        seedBeneficiaire({
          ...(prenom === undefined ? {} : { prenom }),
          ...(nom === undefined ? {} : { nom }),
        }),
      ),
    )
  },
)

When(
  'je liste les bénéficiaires avec la recherche {string}',
  async (recherche: string) => {
    contexte.listResult = await listerBeneficiaires({
      mediateurId: testMediateurId,
      search: Search(recherche),
    })
  },
)

When(
  'je liste les bénéficiaires avec la recherche {string} par pages de {int}',
  async (recherche: string, pageSize: number) => {
    contexte.listResult = await listerBeneficiaires({
      mediateurId: testMediateurId,
      search: Search(recherche),
      pageSize: PageSize(pageSize),
    })
  },
)

When(
  'je liste les bénéficiaires triés par {string} en {string}',
  async (field: string, direction: string) => {
    contexte.listResult = await listerBeneficiaires({
      mediateurId: testMediateurId,
      sort: Sort(toSortField(field), SortDirection(direction)),
    })
  },
)

Then('la liste contient {int} bénéficiaire(s)', (count: number) => {
  assert.strictEqual(contexte.listResult?.items.length, count)
})

Then('le premier bénéficiaire est {string}', (nom: string) => {
  assert.strictEqual(contexte.listResult?.items[0]?.nom, nom)
})

Then('le nombre total de correspondances est {int}', (count: number) => {
  assert.strictEqual(contexte.listResult?.totalItems, count)
})

Then('le nombre de pages est {int}', (count: number) => {
  assert.ok(contexte.listResult)
  const totalPages = Math.ceil(
    contexte.listResult.totalItems / contexte.listResult.pageSize,
  )
  assert.strictEqual(totalPages, count)
})
