export const cumulsSuccessifs = <Cumul, Element>(
  depart: Cumul,
  elements: readonly Element[],
  ajouter: (cumul: Cumul, element: Element) => Cumul,
): Cumul[] =>
  elements.reduce<{ dernier: Cumul; cumuls: Cumul[] }>(
    ({ dernier, cumuls }, element) => {
      const suivant = ajouter(dernier, element)
      return { dernier: suivant, cumuls: [...cumuls, suivant] }
    },
    { dernier: depart, cumuls: [depart] },
  ).cumuls
