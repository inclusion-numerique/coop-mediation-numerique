import type { AnneeNaissance } from '../annee-naissance'
import type { BeneficiaireId } from '../beneficiaire-id'
import type { CommuneResidence } from '../commune-residence'
import type { Email } from '../email'
import type { MediateurId } from '../mediateur-id'
import type { Nom } from '../nom'
import type { Prenom } from '../prenom'
import type { Telephone } from '../telephone'

export type DuplicateBeneficiaire = {
  readonly id: BeneficiaireId
  readonly nom: Nom | null
  readonly prenom: Prenom | null
  readonly telephone: Telephone | null
  readonly email: Email | null
  readonly creation: Date
  readonly anneeNaissance: AnneeNaissance | null
  readonly communeResidence: CommuneResidence | null
}

type DoublonEntry = {
  readonly id: BeneficiaireId
  readonly nom: Nom
  readonly prenom: Prenom
  readonly telephone: Telephone
  readonly email: Email
  readonly creation: Date
}

export type BeneficiaireDoublon = {
  readonly id: string
  readonly a: DoublonEntry
  readonly b: DoublonEntry
}

export type FindDuplicatesForBeneficiaire = (input: {
  beneficiaire: {
    id: BeneficiaireId | null
    nom: Nom | null
    prenom: Prenom | null
    telephone: Telephone | null
    email: Email | null
    mediateurId: MediateurId
  }
  withConflictingFields: 'include' | 'exclude'
  fuzzyMatching?: boolean
}) => Promise<DuplicateBeneficiaire[]>

export type DetecterDoublons = (input: {
  mediateurId: MediateurId
  fuzzyMatching?: boolean
}) => Promise<{ count: number; duplicates: BeneficiaireDoublon[] }>
