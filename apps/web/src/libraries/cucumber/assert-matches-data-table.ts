import assert from 'node:assert'
import type { DataTable } from '@cucumber/cucumber'

const dataTableToObject = <T = Record<string, string>>(
  dataTable: DataTable,
): T => Object.fromEntries(dataTable.rows()) as T

const getNestedValue = (object: unknown, path: string): unknown =>
  path
    .replace(/\[(\d+)]/g, '.$1')
    .split('.')
    .reduce(
      (current: unknown, key: string) =>
        current == null ? undefined : (current as Record<string, unknown>)[key],
      object,
    )

const extractFields = (
  object: unknown,
  fields: string[],
): Record<string, unknown> =>
  Object.fromEntries(
    fields.map((field) => [field, String(getNestedValue(object, field))]),
  )

/**
 * Asserts that an object matches a Gherkin data table (clé/valeur), comparing
 * only the keys present in the table. Supports nested paths (`a.b`, `a[0]`).
 * Porté depuis @arckit/cucumber (référence ihexa).
 */
export const assertMatchesDataTable =
  (dataTable: DataTable) =>
  (actual: unknown, options?: { message?: string }) => {
    assert.ok(actual, options?.message || 'Object should be defined')
    const expected = dataTableToObject(dataTable)
    assert.deepStrictEqual(
      extractFields(actual, Object.keys(expected)),
      expected,
    )
  }
