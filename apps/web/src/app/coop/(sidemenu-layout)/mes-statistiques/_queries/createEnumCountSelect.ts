import { dureeAccompagnementStatisticsRanges } from '@app/web/features/activites/use-cases/cra/fields/duree-accompagnement'
import { Prisma } from '@prisma/client'
import { snakeCase } from 'change-case'

export const createEnumCountSelect = <T extends string>({
  column,
  as,
  enumObj,
  defaultEnumValue,
  weightColumn,
}: {
  column: string
  as: string
  enumObj: { [key in T]: string }
  defaultEnumValue?: T
  weightColumn?: string
}): Prisma.Sql => {
  const sumStatements = Object.keys(enumObj).map((key) => {
    const snakeCaseValue = snakeCase(enumObj[key as T])

    // Add the IS NULL check only if this key is the default value
    const isNullSnippet =
      key === defaultEnumValue ? ` OR ${column} IS NULL` : ''

    // When weightColumn is provided, multiply by weight for proper aggregation
    const sumExpression = weightColumn
      ? `COALESCE(SUM(CASE WHEN ${column} = '${snakeCaseValue}'${isNullSnippet} THEN ${weightColumn} ELSE 0 END), 0)::int`
      : `COALESCE(SUM((${column} = '${snakeCaseValue}'${isNullSnippet})::int), 0)::int`

    return `${sumExpression} AS ${as}_${snakeCaseValue}_count`
  })

  return Prisma.raw(sumStatements.join(',\n'))
}

export const createEnumArrayCountSelect = <T extends string>({
  column,
  as,
  enumObj,
  weightColumn,
}: {
  column: string
  as: string
  enumObj: { [key in T]: string }
  weightColumn?: string
}): Prisma.Sql => {
  const sumStatements = Object.keys(enumObj).map((key) => {
    const snakeCaseValue = snakeCase(enumObj[key as T])

    // When weightColumn is provided, multiply by weight for proper aggregation
    const sumExpression = weightColumn
      ? `COALESCE(SUM(CASE WHEN '${snakeCaseValue}' = ANY(${column}) THEN ${weightColumn} ELSE 0 END), 0)::int`
      : `COALESCE(SUM(('${snakeCaseValue}' = ANY(${column}))::int), 0)::int`

    return `${sumExpression} AS ${as}_${snakeCaseValue}_count`
  })

  return Prisma.raw(sumStatements.join(',\n'))
}

export const createIntArrayCountSelect = ({
  as,
  column,
  values,
}: {
  column: string
  as: string
  values: number[]
}): Prisma.Sql => {
  const sumStatements = values.map(
    (value) =>
      `COALESCE(SUM((${column} = ${value})::int), 0)::int AS ${as}_${value.toString(
        10,
      )}_count`,
  )

  return Prisma.raw(sumStatements.join(',\n'))
}

export const createDureesRangesSelect = ({
  as,
  column,
  weightColumn,
}: {
  column: string
  as: string
  weightColumn?: string
}): Prisma.Sql => {
  const sumStatements = dureeAccompagnementStatisticsRanges.map(
    ({ key, min, max }) => {
      const maxValue = max !== null && max !== undefined ? max : 2_147_483_647

      // When weightColumn is provided, multiply by weight for proper aggregation
      const sumExpression = weightColumn
        ? `COALESCE(SUM(CASE WHEN ${column} >= ${min} AND ${column} < ${maxValue} THEN ${weightColumn} ELSE 0 END), 0)::int`
        : `COALESCE(SUM((${column} >= ${min} AND ${column} < ${maxValue})::int), 0)::int`

      return `${sumExpression} AS ${as}_${key}_count`
    },
  )

  return Prisma.raw(sumStatements.join(',\n'))
}

/**
 * Creates COUNT(DISTINCT CASE ...) statements for counting distinct entities by enum values.
 * Used for beneficiaire stats where we need to count distinct beneficiaires per category.
 *
 * @param idColumn - The column to count distinct values of (e.g., 'ben.id')
 * @param enumColumn - The column containing the enum value (e.g., 'ben.genre')
 * @param as - Prefix for output column names
 * @param enumObj - The enum object to iterate over
 * @param defaultEnumValue - Optional enum value to treat NULL as
 */
export const createEnumDistinctCountSelect = <T extends string>({
  idColumn,
  enumColumn,
  as,
  enumObj,
  defaultEnumValue,
}: {
  idColumn: string
  enumColumn: string
  as: string
  enumObj: { [key in T]: string }
  defaultEnumValue?: T
}): Prisma.Sql => {
  const countStatements = Object.keys(enumObj).map((key) => {
    const snakeCaseValue = snakeCase(enumObj[key as T])

    // Add the IS NULL check only if this key is the default value
    const isNullSnippet =
      key === defaultEnumValue ? ` OR ${enumColumn} IS NULL` : ''

    return `COUNT(DISTINCT CASE WHEN ${enumColumn} = '${snakeCaseValue}'${isNullSnippet} THEN ${idColumn} END)::int AS ${as}_${snakeCaseValue}_count`
  })

  return Prisma.raw(countStatements.join(',\n'))
}
