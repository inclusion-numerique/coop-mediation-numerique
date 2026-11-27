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
  BeneficiaireNomme,
  CommuneNommee,
  DepartementNomme,
  LieuNomme,
  NomDeFiltre,
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
  readonly nom: NomDeFiltre
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
}) => Promise<readonly LieuNomme[]>

export type CommunesEtDepartements = (perimetre: {
  readonly mediateurIds: readonly MediateurId[]
}) => Promise<{
  readonly communes: readonly CommuneNommee[]
  readonly departements: readonly DepartementNomme[]
}>

export type BeneficiairesNommes = (demande: {
  readonly mediateurId: MediateurId
  readonly ids: readonly BeneficiaireId[]
}) => Promise<readonly BeneficiaireNomme[]>

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
