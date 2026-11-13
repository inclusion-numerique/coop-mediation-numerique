import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { StatutDeRendezVous } from '../../domain'

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

export type StatutDeRendezVousDansLURL =
  | 'unknown'
  | 'past'
  | 'seen'
  | 'revoked'
  | 'excused'
  | 'noshow'

export const libellesDesStatutsDansLURL: Readonly<
  Record<StatutDeRendezVousDansLURL, string>
> = {
  unknown: 'À venir',
  past: 'Passé',
  seen: 'Honoré',
  revoked: 'Annulé',
  excused: 'Annulé par bénéficiaire',
  noshow: 'Absence',
}

export const optionsDesStatutsDeRendezVous: readonly SelectOption<StatutDeRendezVousDansLURL>[] =
  [
    { value: 'unknown', label: libellesDesStatutsDansLURL.unknown },
    { value: 'past', label: libellesDesStatutsDansLURL.past },
    { value: 'seen', label: libellesDesStatutsDansLURL.seen },
    { value: 'revoked', label: libellesDesStatutsDansLURL.revoked },
    { value: 'excused', label: libellesDesStatutsDansLURL.excused },
    { value: 'noshow', label: libellesDesStatutsDansLURL.noshow },
  ]

export const statutDansLURL = (
  valeur: string,
): StatutDeRendezVousDansLURL | null =>
  optionsDesStatutsDeRendezVous.find((option) => option.value === valeur)
    ?.value ?? null

export const libelleDuStatutDansLURL = (valeur: string): string =>
  optionsDesStatutsDeRendezVous.find((option) => option.value === valeur)
    ?.label ?? valeur
