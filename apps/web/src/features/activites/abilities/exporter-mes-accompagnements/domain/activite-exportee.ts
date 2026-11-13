import type { CodeInsee } from '@app/web/libraries/insee'
import type {
  ActiviteId,
  AdresseDuLieu,
  Autonomie,
  DateDActivite,
  DureeEnMinutes,
  Equipement,
  Genre,
  NiveauDAtelier,
  NomDeCommune,
  NomDeFamille,
  NomDeStructure,
  NomDeTag,
  Notes,
  Orientation,
  PrecisionDeDemarche,
  Prenom,
  SourceDeLActivite,
  StatutSocial,
  ThematiqueRecherchee,
  TitreDAtelier,
  TrancheDAge,
  TypeDeLieu,
} from '../../../domain'
import type { CodesPostaux } from './codes-postaux'

export type Localisation = {
  readonly commune: NomDeCommune | null
  readonly codesPostaux: CodesPostaux | null
  readonly codeInsee: CodeInsee | null
}

export type LieuExporte = Localisation & {
  readonly nom: NomDeStructure | null
  readonly adresse: AdresseDuLieu | null
}

export type Identite = {
  readonly prenom: Prenom | null
  readonly nom: NomDeFamille | null
}

export type MediateurExporte = Identite & {
  readonly conseillerNumerique: boolean
}

export type AccompagnementExporte = {
  readonly beneficiaire: Identite
  readonly residence: Localisation
  readonly genre: Genre
  readonly trancheDAge: TrancheDAge
  readonly statutSocial: StatutSocial
  readonly premierAccompagnement: boolean
}

type Commun = {
  readonly id: ActiviteId
  readonly date: DateDActivite
  readonly creation: Date
  readonly modification: Date
  readonly mediateur: MediateurExporte
  readonly typeDeLieu: TypeDeLieu
  readonly lieu: LieuExporte
  readonly duree: DureeEnMinutes
  readonly equipement: Equipement
  readonly thematiques: readonly ThematiqueRecherchee[]
  readonly tags: readonly NomDeTag[]
  readonly precisionDeDemarche: PrecisionDeDemarche | null
  readonly notes: Notes | null
  readonly source: SourceDeLActivite
  readonly accompagnements: readonly AccompagnementExporte[]
}

export type IndividuelExporte = Commun & {
  readonly _tag: 'Individuel'
  readonly autonomie: Autonomie | null
  readonly orientation: Orientation
}

export type CollectifExporte = Commun & {
  readonly _tag: 'Collectif'
  readonly titre: TitreDAtelier | null
  readonly niveau: NiveauDAtelier | null
}

export type ActiviteExportee = IndividuelExporte | CollectifExporte

export type ColonnesDeLExport = {
  readonly personnel: boolean
  readonly source: boolean
}

export type ExportDesAccompagnements = {
  readonly activites: readonly ActiviteExportee[]
  readonly colonnes: ColonnesDeLExport
}
