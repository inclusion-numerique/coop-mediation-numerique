import type { StatutDeRendezVous } from '../../../domain'

export type SeveriteDeBadge = 'new' | 'success' | 'error' | 'warning' | 'info'

type Apparence = {
  readonly libelle: string
  readonly severite: SeveriteDeBadge
}

const APPARENCE: Readonly<
  Record<
    | 'AVenir'
    | 'Passe'
    | 'Honore'
    | 'Annule'
    | 'AnnuleParLeBeneficiaire'
    | 'Absent',
    Apparence
  >
> = {
  AVenir: { libelle: 'À venir', severite: 'new' },
  Passe: { libelle: 'Passé', severite: 'info' },
  Honore: { libelle: 'Honoré', severite: 'success' },
  Annule: { libelle: 'Annulé', severite: 'warning' },
  AnnuleParLeBeneficiaire: {
    libelle: 'Annulé par bénéficiaire',
    severite: 'warning',
  },
  Absent: { libelle: 'Absence', severite: 'error' },
}

const apparence =
  <K extends string>(table: Readonly<Record<K, Apparence>>) =>
  (statut: K): Apparence =>
    table[statut]

export const apparenceDuStatut = (statut: StatutDeRendezVous): Apparence =>
  apparence(APPARENCE)(statut)
