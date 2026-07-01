/**
 * Vue ACL de l'adresse de la structure employeuse — ce dont l'inscription a
 * besoin pour faire créer/retrouver la structure, sans dépendre du domaine de la
 * feature structure ni du type BAN externe.
 */
export type AdresseEmployeuse = {
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
  readonly typologies: readonly string[]
}
