import { isBefore } from 'date-fns'

export enum AlerteFinContrat {
  prochainement = 'prochainement',
  termine = 'termine',
}

export type ContratConseillerNumerique = {
  readonly type: string | null
  readonly debut: Date | null
  readonly fin: Date | null
}

export type LigneContrat = {
  readonly type: string | null
  readonly dateDebut: Date | null
  readonly dateFin: Date | null
  readonly dateRupture: Date | null
}

const libellesTypeContrat: Record<string, string> = {
  CDD: 'CDD',
  CDI: 'CDI',
  CDP: 'Contrat de projet',
  PEC: 'PEC',
}

const libelleTypeContrat = (type: string | null): string | null =>
  type == null ? null : (libellesTypeContrat[type] ?? type)

const plusRecent = (contrats: readonly LigneContrat[]): LigneContrat | null =>
  contrats.toSorted(
    (a, b) => (b.dateDebut?.getTime() ?? 0) - (a.dateDebut?.getTime() ?? 0),
  )[0] ?? null

const estRompu = ({ dateRupture }: LigneContrat, maintenant: Date) =>
  dateRupture != null && isBefore(dateRupture, maintenant)

const finDuContrat = ({ dateFin, dateRupture }: LigneContrat): Date | null =>
  [dateFin, dateRupture]
    .filter((date): date is Date => date != null)
    .toSorted((a, b) => a.getTime() - b.getTime())[0] ?? null

export const contratEnCours = (
  contrats: readonly LigneContrat[],
  maintenant: Date,
): ContratConseillerNumerique | null => {
  const contrat = plusRecent(contrats)
  return contrat == null || estRompu(contrat, maintenant)
    ? null
    : {
        type: libelleTypeContrat(contrat.type),
        debut: contrat.dateDebut,
        fin: finDuContrat(contrat),
      }
}
