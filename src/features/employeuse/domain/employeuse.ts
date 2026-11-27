import type { Siret } from '@/libraries/insee'
import type { AdresseEmployeuse } from './adresse-employeuse'
import type { ContactReferent } from './contact-referent'
import type { DenominationEmployeuse } from './denomination-employeuse'
import type { EmployeuseId } from './employeuse-id'
import type { Rna } from './rna'

export type Employeuse = {
  readonly id: EmployeuseId
  readonly denomination: DenominationEmployeuse | null
  readonly denominationSirene: DenominationEmployeuse | null
  readonly siret: Siret | null
  readonly rna: Rna | null
  readonly adresse: AdresseEmployeuse | null
  readonly contactReferent: ContactReferent
  readonly creation: Date | null
  readonly modification: Date | null
  readonly suppression: Date | null
}
