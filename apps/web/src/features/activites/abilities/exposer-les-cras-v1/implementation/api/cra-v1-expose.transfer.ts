import { z } from 'zod'
import type { CraV1Expose } from '../prisma/cras-v1-exposes.query'

export type CraV1Attributes = {
  imported_at: string
  conseiller_numerique_id: string
  canal: string
  activite: string
  nb_participants: number
  nb_participants_recurrents: number

  age_moins_12_ans: number
  age_de_12_a_18_ans: number
  age_de_18_a_35_ans: number
  age_de_35_a_60_ans: number
  age_plus_60_ans: number

  statut_etudiant: number
  statut_sans_emploi: number
  statut_en_emploi: number
  statut_retraite: number
  statut_heterogene: number

  themes: string[]

  sous_themes_equipement_informatique: string[]
  sous_themes_sante: string[]
  sous_themes_accompagner: string[]
  sous_themes_traitement_texte: string[]

  duree: string
  duree_minutes: number

  accompagnement_individuel: number
  accompagnement_atelier: number
  accompagnement_redirection: number

  code_postal: string
  nom_commune: string
  date_accompagnement: string
  code_commune: string
  organismes: Record<string, number> | null
  annotation: string | null

  created_at: string
  updated_at: string | null

  structure_id: string | null
  structure_id_pg: number | null
  structure_type: string | null
  structure_statut: string | null
  structure_nom: string | null
  structure_siret: string | null
  structure_code_postal: string | null
  structure_nom_commune: string | null
  structure_code_commune: string | null
  structure_code_departement: string | null
  structure_code_region: string | null
}

const OrganismesValidation = z.record(z.string(), z.number()).nullable()

export const craV1Expose = (cra: CraV1Expose): CraV1Attributes => ({
  imported_at: cra.importedAt.toISOString(),
  conseiller_numerique_id: cra.v1ConseillerNumeriqueId,
  canal: cra.canal,
  activite: cra.activite,
  nb_participants: cra.nbParticipants,
  nb_participants_recurrents: cra.nbParticipantsRecurrents,

  age_moins_12_ans: cra.ageMoins12Ans,
  age_de_12_a_18_ans: cra.ageDe12a18Ans,
  age_de_18_a_35_ans: cra.ageDe18a35Ans,
  age_de_35_a_60_ans: cra.ageDe35a60Ans,
  age_plus_60_ans: cra.agePlus60Ans,

  statut_etudiant: cra.statutEtudiant,
  statut_sans_emploi: cra.statutSansEmploi,
  statut_en_emploi: cra.statutEnEmploi,
  statut_retraite: cra.statutRetraite,
  statut_heterogene: cra.statutHeterogene,

  themes: cra.themes,

  sous_themes_equipement_informatique: cra.sousThemesEquipementInformatique,
  sous_themes_sante: cra.sousThemesSante,
  sous_themes_accompagner: cra.sousThemesAccompagner,
  sous_themes_traitement_texte: cra.sousThemesTraitementTexte,

  duree: cra.duree,
  duree_minutes: cra.dureeMinutes,

  accompagnement_individuel: cra.accompagnementIndividuel,
  accompagnement_atelier: cra.accompagnementAtelier,
  accompagnement_redirection: cra.accompagnementRedirection,

  code_postal: cra.codePostal,
  nom_commune: cra.nomCommune,
  date_accompagnement: cra.dateAccompagnement.toISOString(),
  code_commune: cra.codeCommune,
  organismes: OrganismesValidation.parse(cra.organismes),
  annotation: cra.annotation,

  created_at: cra.createdAt.toISOString(),
  updated_at: cra.updatedAt?.toISOString() ?? null,

  structure_id: cra.structureId,
  structure_id_pg: cra.structureIdPg,
  structure_type: cra.structureType,
  structure_statut: cra.structureStatut,
  structure_nom: cra.structureNom,
  structure_siret: cra.structureSiret,
  structure_code_postal: cra.structureCodePostal,
  structure_nom_commune: cra.structureNomCommune,
  structure_code_commune: cra.structureCodeCommune,
  structure_code_departement: cra.structureCodeDepartement,
  structure_code_region: cra.structureCodeRegion,
})
