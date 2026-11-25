import type { EmployeuseDesActivites, TagDeLActivite } from '../../../domain'

export type NomDeFiltre = { readonly label: string; readonly value: string }

export type NomDeFiltreDeBeneficiaire = {
  readonly label: string
  readonly value: { readonly id?: string | null } | null
}

export type MediateurNomme = {
  readonly label: string
  readonly value: { readonly mediateurId: string }
}

export type NomsDesFiltresExportes = {
  readonly beneficiaires: readonly NomDeFiltreDeBeneficiaire[]
  readonly mediateurs: readonly MediateurNomme[]
  readonly employeuses: readonly EmployeuseDesActivites[]
  readonly communes: readonly NomDeFiltre[]
  readonly departements: readonly NomDeFiltre[]
  readonly lieux: readonly NomDeFiltre[]
  readonly tags: readonly TagDeLActivite[]
}
