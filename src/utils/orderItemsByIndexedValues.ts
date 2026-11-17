import { onlyDefinedAndNotNull } from './onlyDefinedAndNotNull'

export const orderItemsByIndexMap = <
  T extends { id: V },
  V extends string | number,
>(
  items: T[],
  indexMap: Map<V, number>,
): T[] => {
  // Sort the items using resultIndexById as their new index
  const sortedItems = Array.from<T>({
    length: indexMap.size,
  })

  for (const item of items) {
    const sortedIndex = indexMap.get(item.id)
    if (sortedIndex === undefined) {
      throw new Error(`Item with id ${item.id} not found in search results`)
    }
    sortedItems[sortedIndex] = item
  }

  // If the items size is not complete, some items will be undefined
  return sortedItems.filter(onlyDefinedAndNotNull)
}

export const orderItemsByIndexedValues = <
  T extends { id: V },
  V extends string | number,
>(
  items: T[],
  indexedValues: V[],
): T[] => {
  const indexMap = new Map<V, number>(
    indexedValues.map((id, index) => [id, index]),
  )

  return orderItemsByIndexMap(items, indexMap)
}
