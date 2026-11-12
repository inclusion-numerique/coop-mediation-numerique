import type { EmployeuseDesActivites, TagDeLActivite } from '../../../domain'

export type NomDeFiltre = { readonly label: string; readonly value: string }

export type NomDeFiltreDeBeneficiaire = {
  readonly label: string
  readonly value: { readonly id?: string | null } | null
}

export type NomDeFiltreDeMediateur = {
  readonly label: string
  readonly value: { readonly mediateurId: string } | null
}

export type NomsDesFiltresExportes = {
  readonly beneficiaires: readonly NomDeFiltreDeBeneficiaire[]
  readonly mediateurs: readonly NomDeFiltreDeMediateur[]
  readonly employeuses: readonly EmployeuseDesActivites[]
  readonly communes: readonly NomDeFiltre[]
  readonly departements: readonly NomDeFiltre[]
  readonly lieux: readonly NomDeFiltre[]
  readonly tags: readonly TagDeLActivite[]
}
