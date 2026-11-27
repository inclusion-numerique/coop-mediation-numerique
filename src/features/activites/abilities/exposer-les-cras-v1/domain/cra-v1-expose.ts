import type {
  ConseillerNumeriqueV1Id,
  CraV1Id,
  StructureV1Id,
} from './identifiants-v1'

export type CraV1Expose = {
  readonly id: CraV1Id
  readonly importedAt: Date
  readonly v1ConseillerNumeriqueId: ConseillerNumeriqueV1Id
  readonly canal: string
  readonly activite: string
  readonly nbParticipants: number
  readonly nbParticipantsRecurrents: number
  readonly ageMoins12Ans: number
  readonly ageDe12a18Ans: number
  readonly ageDe18a35Ans: number
  readonly ageDe35a60Ans: number
  readonly agePlus60Ans: number
  readonly statutEtudiant: number
  readonly statutSansEmploi: number
  readonly statutEnEmploi: number
  readonly statutRetraite: number
  readonly statutHeterogene: number
  readonly themes: string[]
  readonly sousThemesEquipementInformatique: string[]
  readonly sousThemesSante: string[]
  readonly sousThemesAccompagner: string[]
  readonly sousThemesTraitementTexte: string[]
  readonly duree: string
  readonly dureeMinutes: number
  readonly accompagnementIndividuel: number
  readonly accompagnementAtelier: number
  readonly accompagnementRedirection: number
  readonly codePostal: string
  readonly nomCommune: string
  readonly dateAccompagnement: Date
  readonly codeCommune: string
  readonly organismes: unknown
  readonly annotation: string | null
  readonly createdAt: Date
  readonly updatedAt: Date | null
  readonly structureId: StructureV1Id | null
  readonly structureIdPg: number | null
  readonly structureType: string | null
  readonly structureStatut: string | null
  readonly structureNom: string | null
  readonly structureSiret: string | null
  readonly structureCodePostal: string | null
  readonly structureNomCommune: string | null
  readonly structureCodeCommune: string | null
  readonly structureCodeDepartement: string | null
  readonly structureCodeRegion: string | null
}
