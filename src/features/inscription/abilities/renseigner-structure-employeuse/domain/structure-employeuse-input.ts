export type StructureEmployeuseInput = {
  readonly siret: string
  readonly nom: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string
}

export type SaisieEmployeuse = {
  readonly siret: string
  readonly denomination: string | null
  readonly adresse: {
    readonly voie: string
    readonly commune: string
    readonly codePostal: string | null
    readonly codeInsee: string | null
  }
}

export const saisieEmployeuse = ({
  siret,
  nom,
  adresse,
  commune,
  codePostal,
  codeInsee,
}: StructureEmployeuseInput): SaisieEmployeuse => ({
  siret,
  denomination: nom || null,
  adresse: {
    voie: adresse,
    commune,
    codePostal: codePostal || null,
    codeInsee: codeInsee || null,
  },
})
