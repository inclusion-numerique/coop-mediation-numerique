export const unionArrays = <T>(a: T[], b: T[]): T[] => [
  ...new Set([...a, ...b]),
]
