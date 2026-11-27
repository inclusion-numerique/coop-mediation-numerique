import type {
  BeneficiaireId,
  CoordinateurId,
  CriteresDesActivites,
  EmployeuseDesActivites,
  EmployeuseId,
  MediateurId,
  PerimetreDesActivites,
  TagsUtilisables,
} from '../../../domain'
import type { ActiviteExportee } from './activite-exportee'
import type {
  NomDeFiltre,
  NomDeFiltreDeBeneficiaire,
} from './noms-des-filtres-exportes'

export type SelectionDesAccompagnements = {
  readonly perimetre: readonly MediateurId[]
  readonly coordinateurId: CoordinateurId | null
  readonly criteres: CriteresDesActivites
}

export type AccompagnementsExportes = (
  selection: SelectionDesAccompagnements,
) => Promise<readonly ActiviteExportee[]>

export type ImportsV1Presents = (
  mediateurs: readonly MediateurId[],
) => Promise<boolean>

export type MediateurLu = {
  readonly mediateurId: MediateurId
  readonly nom: string
  readonly appartenances: readonly { readonly suppression: Date | null }[]
}

export type MediateursLus = (demande: {
  readonly ids: readonly MediateurId[]
  readonly coordinateurId: CoordinateurId | null
}) => Promise<readonly MediateurLu[]>

export type EmployeusesNommees = (demande: {
  readonly perimetre: PerimetreDesActivites
  readonly ids: readonly EmployeuseId[]
}) => Promise<readonly EmployeuseDesActivites[]>

export type LieuxNommes = (perimetre: {
  readonly mediateurs: readonly MediateurId[]
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
}) => Promise<readonly NomDeFiltre[]>

export type CommunesEtDepartements = (perimetre: {
  readonly mediateurIds: readonly MediateurId[]
}) => Promise<{
  readonly communesOptions: readonly NomDeFiltre[]
  readonly departementsOptions: readonly NomDeFiltre[]
}>

export type BeneficiairesNommes = (demande: {
  readonly mediateurId: MediateurId
  readonly ids: readonly BeneficiaireId[]
}) => Promise<readonly NomDeFiltreDeBeneficiaire[]>

export type ExporterMesAccompagnementsPorts = {
  readonly accompagnementsExportes: AccompagnementsExportes
  readonly importsV1Presents: ImportsV1Presents
  readonly mediateursLus: MediateursLus
  readonly employeusesNommees: EmployeusesNommees
  readonly lieuxNommes: LieuxNommes
  readonly communesEtDepartements: CommunesEtDepartements
  readonly tagsUtilisables: TagsUtilisables
  readonly beneficiairesNommes: BeneficiairesNommes
}
