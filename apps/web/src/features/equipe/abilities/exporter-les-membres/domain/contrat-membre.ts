import type { TypeContrat } from './type-contrat'

export type ContratMembre = {
  readonly type: TypeContrat
  readonly debut: Date | null
  readonly fin: Date | null
}

export type LigneContrat = ContratMembre & {
  readonly rompuLe: Date | null
}

export type MembreAExporter<Ligne> = {
  readonly ligne: Ligne
  readonly contrat: ContratMembre | null
}

const plusRecent = (contrats: readonly LigneContrat[]): LigneContrat | null =>
  contrats.toSorted(
    (a, b) => (b.debut?.getTime() ?? 0) - (a.debut?.getTime() ?? 0),
  )[0] ?? null

const premiereDate = (dates: readonly (Date | null)[]): Date | null =>
  dates
    .filter((date) => date !== null)
    .toSorted((a, b) => a.getTime() - b.getTime())[0] ?? null

export const contratEnCours = (
  contrats: readonly LigneContrat[],
  maintenant: Date,
): ContratMembre | null => {
  const contrat = plusRecent(contrats)
  if (contrat === null) return null
  if (contrat.rompuLe !== null && contrat.rompuLe < maintenant) return null

  return {
    type: contrat.type,
    debut: contrat.debut,
    fin: premiereDate([contrat.fin, contrat.rompuLe]),
  }
}
