import { z } from 'zod'
import type { CodeDepartement, CodeInsee } from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'
import type {
  BeneficiaireId,
  EmployeuseDesActivites,
  LieuActiviteId,
  MediateurId,
  TagDeLActivite,
} from '../../../domain'

export const NomDeFiltre = defineModel(
  z.string().trim().min(1).brand('NomDeFiltre'),
)

export type NomDeFiltre = Model.TypeOf<typeof NomDeFiltre>

export type BeneficiaireNomme = {
  readonly id: BeneficiaireId
  readonly nom: NomDeFiltre
}

export type MediateurNomme = {
  readonly mediateurId: MediateurId
  readonly nom: NomDeFiltre
  readonly ancien: boolean
}

export type CommuneNommee = {
  readonly codeInsee: CodeInsee
  readonly nom: NomDeFiltre
}

export type DepartementNomme = {
  readonly code: CodeDepartement
  readonly nom: NomDeFiltre
}

export type LieuNomme = {
  readonly id: LieuActiviteId
  readonly nom: NomDeFiltre
}

export type NomsDesFiltresExportes = {
  readonly beneficiaires: readonly BeneficiaireNomme[]
  readonly mediateurs: readonly MediateurNomme[]
  readonly employeuses: readonly EmployeuseDesActivites[]
  readonly communes: readonly CommuneNommee[]
  readonly departements: readonly DepartementNomme[]
  readonly lieux: readonly LieuNomme[]
  readonly tags: readonly TagDeLActivite[]
}
