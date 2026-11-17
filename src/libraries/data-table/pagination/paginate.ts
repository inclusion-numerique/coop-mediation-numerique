// Algorithme de pagination headless porté de @arckit/daisyui (ihexa) :
// calcule la fenêtre de pages à afficher (avec spacers configurables) et les
// pages précédente/suivante/dernière. Agnostique du rendu.

export type PaginationSpacer = { spacer: string }
export type PaginationPageItem = { number: number; isCurrent: boolean }

const clamp =
  (lower: number, upper: number) =>
  (value: number): number =>
    Math.min(Math.max(value, lower), upper)

const spacer = (name: string): PaginationSpacer => ({
  spacer: `spacer-${name}`,
})

const toPage =
  (reverse: { end: number; offset: number } = { end: 0, offset: 0 }) =>
  (currentPageNumber: number) =>
  (pageNumber: number): PaginationPageItem => ({
    number: reverse.end - reverse.offset + pageNumber,
    isCurrent: pageNumber === currentPageNumber + reverse.end,
  })

const range =
  (start: number) =>
  (length: number): number[] =>
    Array.from({ length }, (_, index) => index + start)

export const paginate = ({
  itemsCount,
  pageSize,
  currentPage = 1,
  siblingCount = 2,
  boundaryCount = 0,
}: {
  itemsCount: number
  pageSize: number
  currentPage?: number
  siblingCount?: number
  boundaryCount?: number
}): {
  pages: (PaginationPageItem | PaginationSpacer)[]
  lastPage: number
  previousPage: number
  nextPage: number
} => {
  if (itemsCount <= 0 || pageSize <= 0) {
    return {
      pages: [{ number: 1, isCurrent: true }],
      lastPage: 1,
      previousPage: 1,
      nextPage: 1,
    }
  }

  const lastPage = Math.ceil(itemsCount / pageSize)
  const previousPage = Math.max(1, currentPage - 1)
  const nextPage = Math.min(lastPage, currentPage + 1)
  const currentPageNumber = clamp(1, lastPage)(currentPage)

  if (lastPage <= (boundaryCount + siblingCount) * 2 + 3) {
    return {
      pages: range(1)(lastPage).map(toPage()(currentPageNumber)),
      lastPage,
      previousPage,
      nextPage,
    }
  }

  const isInStartBoundary =
    currentPageNumber <= boundaryCount + siblingCount + 2
  const isInEndBoundary =
    currentPageNumber >= lastPage - boundaryCount - siblingCount - 1

  const windowSize = siblingCount * 2 + 1

  const startIndex = isInStartBoundary
    ? 1
    : isInEndBoundary
      ? lastPage - boundaryCount - windowSize
      : currentPageNumber - siblingCount

  const windowPages = range(startIndex)(
    windowSize + (isInStartBoundary || isInEndBoundary ? boundaryCount + 1 : 0),
  ).map(toPage()(currentPageNumber))

  const startBoundaryPages: PaginationPageItem[] = isInStartBoundary
    ? []
    : range(1)(boundaryCount).map(toPage()(currentPageNumber))

  const endBoundaryPages: PaginationPageItem[] = isInEndBoundary
    ? []
    : range(1)(boundaryCount).map(
        toPage({ end: lastPage, offset: boundaryCount })(currentPageNumber),
      )

  return {
    pages: [
      ...(startBoundaryPages.length > 0
        ? [...startBoundaryPages, spacer('start')]
        : []),
      ...windowPages,
      ...(endBoundaryPages.length > 0
        ? [spacer('end'), ...endBoundaryPages]
        : []),
    ],
    lastPage,
    previousPage,
    nextPage,
  }
}
