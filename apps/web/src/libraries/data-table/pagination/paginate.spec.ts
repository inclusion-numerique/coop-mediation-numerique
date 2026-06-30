import { paginate } from './paginate'

const numbers = (pages: ReturnType<typeof paginate>['pages']) =>
  pages.filter((page) => 'number' in page)

const spacers = (pages: ReturnType<typeof paginate>['pages']) =>
  pages.filter((page) => 'spacer' in page)

describe('paginate', () => {
  it('returns a single current page for empty or invalid input', () => {
    expect(paginate({ itemsCount: 0, pageSize: 10 })).toMatchObject({
      pages: [{ number: 1, isCurrent: true }],
      lastPage: 1,
    })
    expect(paginate({ itemsCount: -1, pageSize: 10 }).lastPage).toBe(1)
  })

  it('computes the last page count', () => {
    expect(paginate({ itemsCount: 25, pageSize: 10 }).lastPage).toBe(3)
  })

  it('marks exactly the current page', () => {
    const current = numbers(
      paginate({ itemsCount: 50, pageSize: 10, currentPage: 3 }).pages,
    ).filter((page) => 'isCurrent' in page && page.isCurrent)
    expect(current).toEqual([{ number: 3, isCurrent: true }])
  })

  it('clamps previous and next pages to the bounds', () => {
    expect(
      paginate({ itemsCount: 50, pageSize: 10, currentPage: 1 }),
    ).toMatchObject({ previousPage: 1 })
    expect(
      paginate({ itemsCount: 50, pageSize: 10, currentPage: 5 }),
    ).toMatchObject({ nextPage: 5 })
  })

  it('adds no spacer when all pages fit', () => {
    expect(
      spacers(paginate({ itemsCount: 30, pageSize: 10 }).pages),
    ).toHaveLength(0)
  })

  it('surrounds a middle page with two spacers when boundaries are kept', () => {
    const { pages } = paginate({
      itemsCount: 200,
      pageSize: 10,
      currentPage: 10,
      boundaryCount: 1,
    })
    expect(spacers(pages)).toHaveLength(2)
    expect(numbers(pages)[0]).toMatchObject({ number: 1 })
  })
})
