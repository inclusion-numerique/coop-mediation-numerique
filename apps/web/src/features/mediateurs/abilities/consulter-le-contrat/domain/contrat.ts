import { addMonths, isBefore } from 'date-fns'
import { EcheanceDuContrat } from './echeance-du-contrat'
import type { TypeDeContrat } from './type-de-contrat'

export const PREAVIS_DE_FIN_EN_MOIS = 3

export type LigneDeContrat = {
  readonly type: TypeDeContrat | null
  readonly debut: Date | null
  readonly fin: Date | null
  readonly rupture: Date | null
}

export type Contrat = {
  readonly type: TypeDeContrat | null
  readonly debut: Date | null
  readonly fin: Date | null
  readonly echeance: EcheanceDuContrat
}

const plusRecente = (
  lignes: readonly LigneDeContrat[],
): LigneDeContrat | null =>
  lignes.toSorted(
    (a, b) => (b.debut?.getTime() ?? 0) - (a.debut?.getTime() ?? 0),
  )[0] ?? null

const estRompue = ({ rupture }: LigneDeContrat, maintenant: Date) =>
  rupture != null && isBefore(rupture, maintenant)

const finDe = ({ fin, rupture }: LigneDeContrat): Date | null =>
  [fin, rupture]
    .filter((date): date is Date => date != null)
    .toSorted((a, b) => a.getTime() - b.getTime())[0] ?? null

const echeanceDe = (fin: Date | null, maintenant: Date): EcheanceDuContrat => {
  if (fin == null) return EcheanceDuContrat('EnCours')
  if (isBefore(fin, maintenant)) return EcheanceDuContrat('Termine')
  return isBefore(fin, addMonths(maintenant, PREAVIS_DE_FIN_EN_MOIS))
    ? EcheanceDuContrat('FinProchaine')
    : EcheanceDuContrat('EnCours')
}

export const dernierContrat = (
  lignes: readonly LigneDeContrat[],
  maintenant: Date,
): Contrat | null => {
  const ligne = plusRecente(lignes)
  if (ligne == null || estRompue(ligne, maintenant)) return null

  const fin = finDe(ligne)
  return {
    type: ligne.type,
    debut: ligne.debut,
    fin,
    echeance: echeanceDe(fin, maintenant),
  }
}
