import {
  AUTONOMIES,
  MATERIELS,
  NIVEAUX_D_ATELIER,
  STRUCTURES_DE_REDIRECTION,
  THEMATIQUES_ADMINISTRATIVES,
  THEMATIQUES_DE_MEDIATION,
  TYPES_D_ACTIVITE,
  TYPES_DE_LIEU,
} from '../../../../domain'

type Materiel = (typeof MATERIELS)[number] | 'Aucun'
type TypeLieu = (typeof TYPES_DE_LIEU)[number]
type Autonomie = (typeof AUTONOMIES)[number]
type NiveauAtelier = (typeof NIVEAUX_D_ATELIER)[number]
type StructureDeRedirection = (typeof STRUCTURES_DE_REDIRECTION)[number]
type TypeActivite = (typeof TYPES_D_ACTIVITE)[number]
type Thematique =
  | (typeof THEMATIQUES_DE_MEDIATION)[number]
  | 'AideAuxDemarchesAdministratives'
  | (typeof THEMATIQUES_ADMINISTRATIVES)[number]

export const materielApiValues = {
  Ordinateur: 'ordinateur',
  Telephone: 'telephone',
  Tablette: 'tablette',
  Autre: 'autre',
  Aucun: 'aucun',
} as const satisfies {
  [key in Materiel]: string
}

export const typeLieuApiValues = {
  LieuActivite: 'lieu_activite',
  Autre: 'autre',
  Domicile: 'domicile',
  ADistance: 'a_distance',
} as const satisfies {
  [key in TypeLieu]: string
}

export const autonomieApiValues = {
  EntierementAccompagne: 'entierement_accompagne',
  PartiellementAutonome: 'partiellement_autonome',
  Autonome: 'autonome',
} as const satisfies {
  [key in Autonomie]: string
}

export const niveauAtelierApiValues = {
  Debutant: 'debutant',
  Intermediaire: 'intermediaire',
  Avance: 'avance',
} as const satisfies {
  [key in NiveauAtelier]: string
}

export const structureDeRedirectionApiValues = {
  OperateurOuOrganismeEnCharge: 'operateur_ou_organisme_en_charge',
  AideAuxDemarchesAdministratives: 'aide_aux_demarches_administratives',
  Administration: 'administration',
  MediationNumerique: 'mediation_numerique',
  AideSociale: 'aide_sociale',
  InsertionProfessionnelle: 'insertion_professionnelle',
  Autre: 'autre',
} as const satisfies {
  [key in StructureDeRedirection]: string
}

export const typeActiviteApiValues = {
  Individuel: 'individuel',
  Collectif: 'collectif',
} as const satisfies {
  [key in TypeActivite]: string
}

export const thematiquesNonAdministrativesApiValues = {
  DiagnosticNumerique: 'diagnostic_numerique',
  PrendreEnMainDuMateriel: 'prendre_en_main_du_materiel',
  MaintenanceDeMateriel: 'maintenance_de_materiel',
  GereSesContenusNumeriques: 'gere_ses_contenus_numeriques',
  NavigationSurInternet: 'navigation_sur_internet',
  Email: 'email',
  Bureautique: 'bureautique',
  ReseauxSociaux: 'reseaux_sociaux',
  Sante: 'sante',
  BanqueEtAchatsEnLigne: 'banque_et_achats_en_ligne',
  Entrepreneuriat: 'entrepreneuriat',
  InsertionProfessionnelle: 'insertion_professionnelle',
  SecuriteNumerique: 'securite_numerique',
  Parentalite: 'parentalite',
  ScolariteEtNumerique: 'scolarite_et_numerique',
  CreerAvecLeNumerique: 'creer_avec_le_numerique',
  CultureNumerique: 'culture_numerique',
  IntelligenceArtificielle: 'intelligence_artificielle',
  AideAuxDemarchesAdministratives: 'aide_aux_demarches_administratives',
} as const

export const thematiquesAdministrativesApiValues = {
  PapiersElectionsCitoyennete: 'papiers_elections_citoyennete',
  FamilleScolarite: 'famille_scolarite',
  SocialSante: 'social_sante',
  TravailFormation: 'travail_formation',
  Logement: 'logement',
  TransportsMobilite: 'transports_mobilite',
  ArgentImpots: 'argent_impots',
  Justice: 'justice',
  EtrangersEurope: 'etrangers_europe',
  LoisirsSportsCulture: 'loisirs_sports_culture',
  Associations: 'associations',
} as const

export const thematiqueApiValues = {
  ...thematiquesNonAdministrativesApiValues,
  ...thematiquesAdministrativesApiValues,
} satisfies {
  [key in Thematique]: string
}
