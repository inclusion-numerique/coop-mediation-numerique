import type { PrismaPg } from '@prisma/adapter-pg'
import { parse } from 'postgres-array'

type PrismaPgOptions = NonNullable<ConstructorParameters<typeof PrismaPg>[1]>
type UserDefinedTypeParser = NonNullable<
  PrismaPgOptions['userDefinedTypeParser']
>
type Queryable = Parameters<UserDefinedTypeParser>[2]

const ENUM_ARRAY_OIDS_SQL = `
  SELECT array_type.oid
  FROM pg_type array_type
    JOIN pg_type element_type ON element_type.oid = array_type.typelem
  WHERE array_type.typcategory = 'A' AND element_type.typtype = 'e'
`

const enumArrayOidsOf = async (queryable: Queryable): Promise<Set<number>> => {
  const { rows } = await queryable.queryRaw({
    sql: ENUM_ARRAY_OIDS_SQL,
    args: [],
    argTypes: [],
  })
  return new Set(rows.map(([oid]) => Number(oid)))
}

export const createEnumArrayTypeParser = (): UserDefinedTypeParser => {
  const cache = new Map<'oids', Promise<Set<number>>>()

  const enumArrayOids = (queryable: Queryable) => {
    const cached = cache.get('oids')
    if (cached) return cached
    const oids = enumArrayOidsOf(queryable)
    cache.set('oids', oids)
    return oids
  }

  return async (oid, value, queryable) =>
    typeof value === 'string' && (await enumArrayOids(queryable)).has(oid)
      ? parse(value)
      : value
}
