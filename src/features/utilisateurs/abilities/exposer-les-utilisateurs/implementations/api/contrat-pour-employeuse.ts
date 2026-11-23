const debut = (contrat: { dateDebut: Date | null }): number =>
  contrat.dateDebut?.getTime() ?? 0

export const contratPourEmployeuse = <
  Ligne extends { structureId: number | null; dateDebut: Date | null },
>(
  contrats: readonly Ligne[],
  employeuseId: number,
): Ligne | null =>
  contrats
    .filter((contrat) => contrat.structureId === employeuseId)
    .toSorted((a, b) => debut(b) - debut(a))
    .at(0) ?? null
