import { Page, PageSize } from '@arckit/resultset'
import { createParser } from 'nuqs/server'
import type { PieceLue } from './piece'

const parseurDePage = createParser({
  parse: (lue) => {
    const page = Number(lue)
    return Number.isInteger(page) && page >= 1 ? page : null
  },
  serialize: String,
})

const parseurDeLignes = <L extends number>(lignes: readonly L[]) =>
  createParser({
    parse: (lue) =>
      lignes.find((proposees) => String(proposees) === lue) ?? null,
    serialize: String,
  })

const parametresDeLaPagination = <L extends number>(
  lignes: readonly L[],
  parDefaut: L,
) => ({
  page: parseurDePage.withDefault(1),
  lignes: parseurDeLignes(lignes).withDefault(parDefaut),
})

export type PaginationLue = {
  readonly page: Page
  readonly pageSize: PageSize
}

export type Pagination<L extends number> = PieceLue<
  ReturnType<typeof parametresDeLaPagination<L>>,
  { readonly pagination: PaginationLue }
> & {
  readonly _tag: 'Pagination'
  readonly lignes: readonly L[]
  readonly parDefaut: L
}

export const pagination = <const L extends readonly number[]>({
  lignes,
  parDefaut,
}: {
  lignes: L
  parDefaut: NoInfer<L[number]>
}): Pagination<L[number]> => ({
  _tag: 'Pagination',
  lignes,
  parDefaut,
  parametres: parametresDeLaPagination(lignes, parDefaut),
  lire: ({ page, lignes: lues }) => ({
    pagination: { page: Page(page), pageSize: PageSize(lues) },
  }),
  ecrire: ({ pagination: lue }) =>
    lue === undefined ? {} : { page: lue.page, lignes: lue.pageSize },
})
