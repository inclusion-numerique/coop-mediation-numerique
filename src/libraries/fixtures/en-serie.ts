export const enSerie = <T, R>(
  elements: readonly T[],
  traiter: (element: T) => Promise<R>,
): Promise<R[]> =>
  elements.reduce<Promise<R[]>>(
    (precedents, element) =>
      precedents.then(async (resultats) => [
        ...resultats,
        await traiter(element),
      ]),
    Promise.resolve([]),
  )
