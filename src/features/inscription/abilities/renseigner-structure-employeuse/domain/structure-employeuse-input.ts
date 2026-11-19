/**
 * Vue ACL de l'adresse de la structure employeuse — ce dont l'inscription a
 * besoin pour faire créer/retrouver la structure, sans dépendre du domaine de la
 * feature structure ni du type BAN externe.
 */
type AdresseEmployeuse = {
  readonly id: string
  readonly nom: string
  readonly commune: string
  readonly codeInsee: string
  readonly codePostal: string
  readonly contexte: string
  readonly latitude: number
  readonly longitude: number
}

/** Input validé décrivant la structure employeuse choisie/saisie. */
export type StructureEmployeuseInput = {
  readonly id: string | null
  readonly nom: string
  readonly siret: string
  readonly adresse: AdresseEmployeuse
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
}: StructureEmployeuseInput): SaisieEmployeuse => ({
  siret,
  denomination: nom || null,
  adresse: {
    voie: adresse.nom,
    commune: adresse.commune,
    codePostal: adresse.codePostal || null,
    codeInsee: adresse.codeInsee || null,
  },
})
