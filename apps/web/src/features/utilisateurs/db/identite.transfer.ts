import {
  AdresseCourriel,
  type Identite,
  Nom,
  NomAffiche,
  Prenom,
} from '../domain'

export type IdentiteRow = {
  readonly firstName: string | null
  readonly lastName: string | null
  readonly name: string | null
  readonly email: string
}

export const identiteToDomain = (row: IdentiteRow): Identite => ({
  prenom: Prenom.safe(row.firstName ?? ''),
  nom: Nom.safe(row.lastName ?? ''),
  nomComplet: NomAffiche.safe(row.name ?? ''),
  courriel: AdresseCourriel(row.email),
})
