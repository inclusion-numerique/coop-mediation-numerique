export const DEFAULT_PAGE_SIZE = 50
export const DEFAULT_PAGE = 1

export const toNumberOr = (numberToParse?: string) => (defaultValue: number) =>
  numberToParse == null ? defaultValue : Number.parseInt(numberToParse, 10)
