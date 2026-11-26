import { telephoneDisplayString } from '@/libraries/telephone'
import { referentAffichage } from '../../domain/contact-referent'
import type { Employeuse } from '../../domain/employeuse'

export type EmployeuseAffichage = {
  id: number
  nom: string | null
  adresse: string | null
  commune: string | null
  codePostal: string | null
  codeInsee: string | null
  siret: string | null
  rna: string | null
  aUnReferent: boolean
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
}

const telephoneReferentFormate = <
  T extends { telephoneReferent: string | null },
>(
  referent: T,
): T => ({
  ...referent,
  telephoneReferent: referent.telephoneReferent
    ? telephoneDisplayString(referent.telephoneReferent)
    : null,
})

export const employeuseAffichage = (
  employeuse: Employeuse,
): EmployeuseAffichage => ({
  id: employeuse.id,
  nom: employeuse.denomination,
  adresse: employeuse.adresse?.voie ?? null,
  commune: employeuse.adresse?.commune ?? null,
  codePostal: employeuse.adresse?.codePostal ?? null,
  codeInsee: employeuse.adresse?.codeInsee ?? null,
  siret: employeuse.siret,
  rna: employeuse.rna,
  ...telephoneReferentFormate(referentAffichage(employeuse.contactReferent)),
})
