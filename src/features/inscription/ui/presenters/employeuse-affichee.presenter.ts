type EmployeuseLue = {
  readonly id: number
  readonly nom: string | null
  readonly adresse: string | null
  readonly commune: string | null
  readonly codePostal: string | null
  readonly codeInsee: string | null
  readonly siret: string | null
  readonly rna: string | null
  readonly nomReferent: string | null
  readonly courrielReferent: string | null
  readonly telephoneReferent: string | null
}

export const employeuseAffichee = ({
  id,
  nom,
  adresse,
  commune,
  codePostal,
  codeInsee,
  siret,
  rna,
  nomReferent,
  courrielReferent,
  telephoneReferent,
}: EmployeuseLue) => ({
  id,
  nom: nom ?? '',
  adresse,
  commune,
  codePostal,
  codeInsee,
  complementAdresse: null,
  siret,
  rna,
  nomReferent,
  courrielReferent,
  telephoneReferent,
})

export type EmployeuseAffichee = ReturnType<typeof employeuseAffichee>
