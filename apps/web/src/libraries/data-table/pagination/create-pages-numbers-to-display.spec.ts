import { createPagesNumbersToDisplay } from './create-pages-numbers-to-display'

describe('createPagesNumbersToDisplay', () => {
  it('lists every page when there are few of them', () => {
    expect(createPagesNumbersToDisplay(4, 1)).toEqual([1, 2, 3, 4])
  })

  it('uses a single ellipsis near the start', () => {
    expect(createPagesNumbersToDisplay(10, 2)).toEqual([
      1,
      2,
      3,
      'separator',
      8,
      9,
      10,
    ])
  })

  it('uses a single ellipsis near the end', () => {
    expect(createPagesNumbersToDisplay(10, 9)).toEqual([
      1,
      2,
      3,
      'separator',
      8,
      9,
      10,
    ])
  })

  it('surrounds a middle page with two ellipses', () => {
    expect(createPagesNumbersToDisplay(10, 5)).toEqual([
      1,
      'separator1',
      4,
      5,
      6,
      'separator2',
      10,
    ])
  })
})
