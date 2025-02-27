import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { dureeAsString } from '@app/web/utils/dureeAsString'
import {
  Autonomie,
  DegreDeFinalisationDemarche,
  Materiel,
  NiveauAtelier,
  ProfilInscription,
  StructureDeRedirection,
  Thematique,
  ThematiqueDemarcheAdministrative,
  TypeActivite,
  TypeLieu,
} from '@prisma/client'

export const typeActivitePluralLabels: {
  [key in TypeActivite]: string
} = {
  Individuel: 'Accompagnements individuels',
  Demarche: 'Aides aux démarches administratives',
  Collectif: 'Ateliers collectifs',
}

export type TypeActiviteSlug = 'individuel' | 'demarche' | 'collectif'

export const typeActiviteSlugs: { [key in TypeActivite]: TypeActiviteSlug } = {
  Individuel: 'individuel',
  Demarche: 'demarche',
  Collectif: 'collectif',
}

export const typeActiviteLabels: {
  [key in TypeActivite]: string
} = {
  Individuel: 'Accompagnement individuel',
  Demarche: 'Aide aux démarches administratives',
  Collectif: 'Atelier collectif',
}

export const typeActiviteForSlug: { [key in TypeActiviteSlug]: TypeActivite } =
  {
    individuel: 'Individuel',
    demarche: 'Demarche',
    collectif: 'Collectif',
  }

export const typeActiviteSlugLabels: {
  [key in TypeActiviteSlug]: string
} = {
  individuel: typeActiviteLabels[typeActiviteForSlug.individuel],
  demarche: typeActiviteLabels[typeActiviteForSlug.demarche],
  collectif: typeActiviteLabels[typeActiviteForSlug.collectif],
}

export const typeActiviteIllustrations: {
  [key in TypeActivite]?: string
} = {
  Individuel: '/images/iconographie/accompagnement-individuel.svg',
  Demarche: '/images/iconographie/demarche-administrative.svg',
  Collectif: '/images/iconographie/accompagnement-collectif.svg',
}

export const typeActiviteValues = Object.keys(typeActiviteLabels) as [
  TypeActivite,
  ...TypeActivite[],
]

export const typeActiviteOptions = labelsToOptions(typeActiviteLabels)

export const typeActiviteSlugOptions = labelsToOptions(typeActiviteSlugLabels)

export const typeActiviteSlugValues = Object.keys(typeActiviteSlugLabels) as [
  TypeActiviteSlug,
  ...TypeActiviteSlug[],
]

export const typeActiviteApiValues = {
  Individuel: 'individuel',
  Demarche: 'demarche_administrative',
  Collectif: 'collectif',
} as const satisfies {
  [key in TypeActivite]: string
}

type FilterableProfils = Exclude<
  ProfilInscription,
  'Coordinateur' | 'CoordinateurConseillerNumerique'
>

export const profilPluralLabels: {
  [key in FilterableProfils]: string
} = {
  Mediateur: 'Médiateurs',
  ConseillerNumerique: 'Conseillers numériques',
}

export type ProfilSlug = 'mediateur' | 'conseiller-numerique'

export const profilLabels: {
  [key in FilterableProfils]: string
} = {
  Mediateur: 'Médiateur',
  ConseillerNumerique: 'Conseiller numérique',
}

export const profilSlugs: { [key in ProfilSlug]: FilterableProfils } = {
  mediateur: 'Mediateur',
  'conseiller-numerique': 'ConseillerNumerique',
}

export const profilSlugLabels: {
  [key in ProfilSlug]: string
} = {
  mediateur: profilLabels[profilSlugs.mediateur],
  'conseiller-numerique': profilLabels[profilSlugs['conseiller-numerique']],
}

export const profilValues = Object.keys(profilLabels) as [
  ProfilInscription,
  ...ProfilInscription[],
]

export const profilOptions = labelsToOptions(profilLabels)

export const profilSlugOptions = labelsToOptions(profilSlugLabels)

export const profilSlugValues = Object.keys(profilSlugLabels) as [
  ProfilSlug,
  ...ProfilSlug[],
]

export const profilApiValues = {
  Mediateur: profilSlugs.mediateur,
  ConseillerNumerique: profilSlugs['conseiller-numerique'],
} as const satisfies {
  [key in FilterableProfils]: string
}

export const dureeAccompagnementPersonnaliseeValue = 'personnaliser'

export const dureeAccompagnementParDefautLabels = {
  '15': dureeAsString(15),
  '30': dureeAsString(30),
  '45': dureeAsString(45),
  '60': dureeAsString(60),
  '90': dureeAsString(90),
  '120': dureeAsString(120),
  [dureeAccompagnementPersonnaliseeValue]: 'Personnaliser',
} as const

export const dureeAccompagnementStatisticsRanges = [
  {
    key: '30',
    min: 0,
    max: 30,
    label: 'Moins de 30 min',
  },
  {
    key: '60',
    min: 30,
    max: 60,
    label: '30min à 1 h',
  },
  {
    key: '120',
    min: 60,
    max: 120,
    label: '1 h à 2 h',
  },
  {
    key: 'more',
    min: 120,
    max: null,
    label: '2 h et plus',
  },
]

export type DefaultDureeAccompagnementParDefaut =
  keyof typeof dureeAccompagnementParDefautLabels

export const dureeAcompagnementParDefautDefaultValues = Object.keys(
  dureeAccompagnementParDefautLabels,
) as [
  DefaultDureeAccompagnementParDefaut,
  ...DefaultDureeAccompagnementParDefaut[],
]

export const dureeAccompagnementParDefautOptions = labelsToOptions(
  dureeAccompagnementParDefautLabels,
)

export const typeLieuLabels: { [key in TypeLieu]: string } = {
  LieuActivite: 'Lieu d’activité',
  Autre: 'Autre lieu',
  Domicile: 'À domicile',
  ADistance: 'À distance',
}

export const typeLieuIllustrations: {
  [key in TypeLieu]?: string
} = {
  LieuActivite: '/dsfr/artwork/pictograms/buildings/city-hall.svg',
  Autre: '/dsfr/artwork/pictograms/buildings/school.svg',
  Domicile: '/images/iconographie/thematique-logement.svg',
  ADistance: '/images/iconographie/mednum-internet.svg',
}

export const typeLieuOptions = labelsToOptions(typeLieuLabels)

export const typeLieuOptionsWithExtras = typeLieuOptions.map(
  ({ label, value }) => ({
    label,
    value,
    extra: {
      illustration: typeLieuIllustrations[value],
    },
  }),
)

export const typeLieuValues = Object.keys(typeLieuLabels) as [
  TypeLieu,
  ...TypeLieu[],
]

export const typeLieuApiValues = {
  LieuActivite: 'lieu_activite',
  Autre: 'autre',
  Domicile: 'domicile',
  ADistance: 'a_distance',
} as const satisfies {
  [key in TypeLieu]: string
}

export const materielLabels: {
  [key in Materiel]: string
} = {
  Ordinateur: 'Ordinateur',
  Telephone: 'Téléphone',
  Tablette: 'Tablette',
  Autre: 'Autre',
  Aucun: 'Pas de matériel',
}

export const materielIcons: {
  [key in Materiel]: { icon: string; rotation?: number }
} = {
  Ordinateur: { icon: 'ri-computer-line' },
  Telephone: { icon: 'ri-smartphone-line' },
  Tablette: { icon: 'ri-tablet-line', rotation: -90 },
  Autre: { icon: 'ri-remote-control-line' },
  Aucun: { icon: 'ri-loader-fill' },
}

export const materielOptions = labelsToOptions(materielLabels)

export const materielValues = Object.keys(materielLabels) as [
  Materiel,
  ...Materiel[],
]

export const materielApiValues = {
  Ordinateur: 'ordinateur',
  Telephone: 'telephone',
  Tablette: 'tablette',
  Autre: 'autre',
  Aucun: 'aucun',
} as const satisfies {
  [key in Materiel]: string
}

export const thematiqueLabels: {
  [key in Thematique]: string
} = {
  DiagnosticNumerique: 'Diagnostic numérique',
  PrendreEnMainDuMateriel: 'Prendre en main du matériel',
  NavigationSurInternet: 'Navigation sur internet',
  Email: 'E-mail',
  Bureautique: 'Bureautique',
  ReseauxSociaux: 'Réseaux sociaux communication',
  Sante: 'Santé',
  BanqueEtAchatsEnLigne: 'Banque et achats en ligne',
  Entrepreneuriat: 'Accompagner un professionnel',
  InsertionProfessionnelle: 'Insertion professionnelle',
  SecuriteNumerique: 'Prévention en sécurité numérique',
  Parentalite: 'Parentalité',
  ScolariteEtNumerique: 'Scolarité et numérique',
  CreerAvecLeNumerique: 'Gérer ses contenus numériques',
  CultureNumerique: 'Culture numérique',
  IntelligenceArtificielle: 'Intelligence artificielle (IA)',
}

export const thematiqueShortLabels = {
  ...thematiqueLabels,
  ReseauxSociaux: 'Réseaux sociaux',
  SecuriteNumerique: 'Sécurité numérique',
  IntelligenceArtificielle: 'Intelligence artificielle',
}

export const thematiqueHints: {
  [key in Thematique]?: string[]
} = {
  DiagnosticNumerique: [
    'Évaluation des compétences numériques des bénéficiaires',
    'Réaliser un questionnaire d’évaluation (ex : ABC Diag de Pix)',
  ],
  PrendreEnMainDuMateriel: [
    'Utiliser un ordinateur, une tablette ou un smartphone',
    'Utiliser des périphériques (réseau wifi, clé USB, imprimante, scanner…)',
    'Connaître & configurer les outils de base',
  ],
  NavigationSurInternet: [
    'Faire une recherche',
    'Naviguer sur internet',
    'Me connecter, remplir un formulaire…',
  ],
  Email: [
    'Choisir & créer une boîte mail',
    'Envoyer et consulter des mails',
    'Envoyer et recevoir des documents',
  ],
  Bureautique: [
    'Outils de traitement de texte, tableur…',
    'Gérer mes documents',
  ],
  ReseauxSociaux: [
    'Maintenir un lien social avec les réseaux sociaux.',
    'Utiliser son téléphone pour communiquer : Mails, Sms, Whatsapp, etc.',
    'Prendre en main un logiciel de visioconférence.',
  ],
  Sante: [
    'Ameli',
    'Mon Espace Santé',
    'Prendre rendez-vous chez un spécialiste (Doctolib…)',
  ],
  BanqueEtAchatsEnLigne: [
    'Application bancaire',
    'Effectuer un achat en ligne',
    'Gérer son budget (tableurs, etc.)',
  ],
  Entrepreneuriat: [
    'Créer mon entreprise',
    'Communication professionnelle (Site internet, réseaux sociaux…)',
    'Outils pour gérer mon entreprise : comptabilité, gestion, collaboration, etc.',
  ],
  InsertionProfessionnelle: [
    'France Travail, Mon Compte Formation…',
    'Créer & diffuser son CV en ligne',
    'Rechercher un emploi en ligne',
  ],
  SecuriteNumerique: [
    'Me connecter sans risque',
    'Protéger mes informations personnelles',
    'Reconnaître les sites et messages frauduleux',
  ],
  Parentalite: [
    'Utiliser une plateforme de suivi scolaire',
    'Sites et logiciels éducatifs',
    'Dangers pour mon enfant & harcèlement',
  ],
  ScolariteEtNumerique: [
    'Accompagner un groupe scolaire et/ou un enfant sur un outil',
    'Évaluer le niveau des jeunes avec un logiciel (maths, français, etc.)',
  ],
  CreerAvecLeNumerique: [
    'Création de médias : photos, vidéos, illustrations',
    'Fablabs : impression 3D, code',
  ],
  CultureNumerique: [
    'Usages responsables du numérique',
    'Fake news, éducation aux médias',
    'Citoyenneté & engagement',
    'RGPD, Open Source, Licences libres…',
  ],
  IntelligenceArtificielle: [
    'Comprendre les enjeux autour de l’IA',
    'Utiliser et interagir de manière critique avec les outils d’IA',
    'Animer un Café IA dans le cadre d’un atelier collectif',
  ],
}

export const thematiqueIllustrations: {
  [key in Thematique]?: string
} = {
  DiagnosticNumerique: '/images/iconographie/mednum-diagnostic.svg',
  PrendreEnMainDuMateriel: '/images/iconographie/mednum-materiel.svg',
  NavigationSurInternet: '/images/iconographie/mednum-internet.svg',
  Email: '/images/iconographie/mednum-email.svg',
  Bureautique: '/images/iconographie/mednum-bureautique.svg',
  ReseauxSociaux: '/images/iconographie/mednum-reseaux-sociaux.svg',
  Sante: '/images/iconographie/mednum-sante.svg',
  BanqueEtAchatsEnLigne: '/images/iconographie/thematique-argent.svg',
  Entrepreneuriat: '/images/iconographie/thematique-travail.svg',
  InsertionProfessionnelle: '/images/iconographie/mednum-insertion.svg',
  SecuriteNumerique: '/images/iconographie/mednum-securite.svg',
  Parentalite: '/images/iconographie/mednum-parentalite.svg',
  ScolariteEtNumerique: '/images/iconographie/mednum-scolarite.svg',
  CreerAvecLeNumerique: '/images/iconographie/mednum-creer.svg',
  CultureNumerique: '/images/iconographie/mednum-culture-numerique.svg',
  IntelligenceArtificielle:
    '/images/iconographie/intelligence-artificielle.svg',
}

export const thematiqueOptions = labelsToOptions(thematiqueLabels)

export const thematiqueOptionsWithExtras = thematiqueOptions.map(
  ({ label, value }) => ({
    label,
    value,
    extra: {
      tooltips: thematiqueHints[value],
      illustration: thematiqueIllustrations[value],
    },
  }),
)

export const thematiqueValues = Object.keys(thematiqueLabels) as [
  Thematique,
  ...Thematique[],
]

export const thematiqueApiValues = {
  DiagnosticNumerique: 'diagnostic_numerique',
  PrendreEnMainDuMateriel: 'prendre_en_main_du_materiel',
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
} as const satisfies {
  [key in Thematique]: string
}

export const autonomieLabels: {
  [key in Autonomie]: string
} = {
  EntierementAccompagne: 'Avec guidage',
  PartiellementAutonome: 'Autonome avec guidage en cas de besoin',
  Autonome: 'Autonome',
}

export const autonomieApiValues = {
  EntierementAccompagne: 'entierement_accompagne',
  PartiellementAutonome: 'partiellement_autonome',
  Autonome: 'autonome',
} as const satisfies {
  [key in Autonomie]: string
}

// Same thing as thematiques for ThematiqueDemarcheAdministrative
export const thematiqueDemarcheAdministrativeLabels: {
  [key in ThematiqueDemarcheAdministrative]: string
} = {
  PapiersElectionsCitoyennete: 'Papiers - Élections Citoyenneté',
  FamilleScolarite: 'Famille - Scolarité',
  SocialSante: 'Social - Santé',
  TravailFormation: 'Travail - Formation',
  Logement: 'Logement',
  TransportsMobilite: 'Transports - Mobilité',
  ArgentImpots: 'Argent - Impôts',
  Justice: 'Justice',
  EtrangersEurope: 'Étrangers - Europe',
  LoisirsSportsCulture: 'Loisirs - Sports Culture',
}

export const thematiqueDemarcheAdministrativeIllustrations: {
  [key in ThematiqueDemarcheAdministrative]?: string
} = {
  PapiersElectionsCitoyennete: '/images/iconographie/thematique-papiers.svg',
  FamilleScolarite: '/images/iconographie/mednum-scolarite.svg',
  SocialSante: '/images/iconographie/thematique-sante.svg',
  TravailFormation: '/images/iconographie/thematique-travail.svg',
  Logement: '/images/iconographie/thematique-logement.svg',
  TransportsMobilite: '/images/iconographie/thematique-transports.svg',
  ArgentImpots: '/images/iconographie/thematique-argent.svg',
  Justice: '/images/iconographie/thematique-justice.svg',
  EtrangersEurope: '/images/iconographie/thematique-etranger.svg',
  LoisirsSportsCulture: '/images/iconographie/thematique-loisirs.svg',
}

export const thematiqueDemarcheAdministrativeHints: {
  [key in ThematiqueDemarcheAdministrative]?: string[]
} = {
  PapiersElectionsCitoyennete: [
    'État-civil, Passeport, Élections, Papiers à conserver, Carte d’identité...',
    'ANTS · Défenseur des droits',
  ],
  FamilleScolarite: [
    'Allocations familiales, Naissance, Mariage, Pacs, Scolarité...',
    'CAF · EduConnect · ameli.fr',
  ],
  SocialSante: [
    'Carte vitale, Chômage, Handicap, RSA, Personnes âgées...',
    'ameli.fr · MSA',
  ],
  TravailFormation: [
    'CDD, Concours, Retraite, Démission, Période d’essai...',
    'Pôle Emploi · Mon compte formation · info-retraite.fr',
  ],
  Logement: [
    'Allocations logement, Permis de construire, Logement social, Fin de bail...',
    'CAF · Enedis',
  ],
  TransportsMobilite: [
    'Carte grise, Permis de conduire, Contrôle technique, Infractions...',
    'ANTS · ANTAI · Crit’air',
  ],
  ArgentImpots: [
    'Crédit immobilier, Impôts, Consommation, Livret A, Assurance, Surendettement...',
    'impots.gouv.fr · Timbres fiscaux',
  ],
  Justice: [
    'Casier judiciaire, Plainte, Aide juridictionnelle, Saisie...',
    'Télérecours citoyens',
  ],
  EtrangersEurope: [
    'Titres de séjour, Attestation d’accueil, Regroupement familial...',
    'OFPRA',
  ],
  LoisirsSportsCulture: [
    'Animaux, Permis bateau, Tourisme, Permis de chasser...',
    'Ariane',
  ],
}

export const thematiqueDemarcheAdministrativeOptions = labelsToOptions(
  thematiqueDemarcheAdministrativeLabels,
)

export const thematiqueDemarcheAdministrativeValues = Object.keys(
  thematiqueDemarcheAdministrativeLabels,
) as [ThematiqueDemarcheAdministrative, ...ThematiqueDemarcheAdministrative[]]

export const thematiqueDemarcheAdministrativeOptionsWithExtras =
  thematiqueDemarcheAdministrativeOptions.map(({ label, value }) => ({
    label,
    value,
    extra: {
      tooltips: thematiqueDemarcheAdministrativeHints[value],
      illustration: thematiqueDemarcheAdministrativeIllustrations[value],
    },
  }))

export const thematiqueDemarcheAdministrativeApiValues = {
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
} as const satisfies {
  [key in ThematiqueDemarcheAdministrative]: string
}

export const autonomieStars: {
  [key in Autonomie]: number
} = {
  EntierementAccompagne: 1,
  PartiellementAutonome: 2,
  Autonome: 3,
}

export const autonomieOptions = labelsToOptions(autonomieLabels)

export const autonomieValues = Object.keys(autonomieLabels) as [
  Autonomie,
  ...Autonomie[],
]

export const autonomieOptionsWithExtras = autonomieOptions.map(
  ({ label, value }) => ({
    label,
    value,
    extra: {
      stars: autonomieStars[value],
      maxStars: 3,
    },
  }),
)

export const structuresRedirectionLabels: {
  [key in StructureDeRedirection]: string
} = {
  OperateurOuOrganismeEnCharge:
    'Opérateur ou organisme en charge de la démarche administrative',
  AideAuxDemarchesAdministratives:
    'Structure d’aide aux démarches administratives (France Services…)',
  Administration: 'Administration (collectivité locale, préfecture…)',
  MediationNumerique: 'Structure de médiation numérique',
  Autre: 'Autre',
}

export const structuresRedirectionOptions = labelsToOptions(
  structuresRedirectionLabels,
)

export const structuresRedirectionValues = Object.keys(
  structuresRedirectionLabels,
) as [StructureDeRedirection, ...StructureDeRedirection[]]

export const structureDeRedirectionApiValues = {
  OperateurOuOrganismeEnCharge: 'operateur_ou_organisme_en_charge',
  AideAuxDemarchesAdministratives: 'aide_aux_demarches_administratives',
  Administration: 'administration',
  MediationNumerique: 'mediation_numerique',
  Autre: 'autre',
} as const satisfies {
  [key in StructureDeRedirection]: string
}

export const niveauAtelierLabels: {
  [key in NiveauAtelier]: string
} = {
  Debutant: 'Débutant',
  Intermediaire: 'Intermédiaire',
  Avance: 'Avancé',
}

export const niveauAtelierStars: {
  [key in NiveauAtelier]: number
} = {
  Debutant: 1,
  Intermediaire: 2,
  Avance: 3,
}

export const niveauAtelierOptions = labelsToOptions(niveauAtelierLabels)

export const niveauAtelierOptionsWithExtras = niveauAtelierOptions.map(
  ({ label, value }) => ({
    label,
    value,
    extra: {
      stars: niveauAtelierStars[value],
      maxStars: 3,
    },
  }),
)

export const niveauAtelierValues = Object.keys(niveauAtelierLabels) as [
  NiveauAtelier,
  ...NiveauAtelier[],
]

export const niveauAtelierApiValues = {
  Debutant: 'debutant',
  Intermediaire: 'intermediaire',
  Avance: 'avance',
} as const satisfies {
  [key in NiveauAtelier]: string
}
export const degreDeFinalisationDemarcheLabels: {
  [key in DegreDeFinalisationDemarche]: string
} = {
  Finalisee: 'Oui',
  AFinaliserEnAutonomie: 'Non',
  DoitRevenir: 'Non',
  OrienteVersStructure: 'Non',
}

export const degreDeFinalisationDemarcheIllustrations: {
  [key in DegreDeFinalisationDemarche]?: string
} = {
  Finalisee: '/dsfr/artwork/pictograms/system/success.svg',
}

export const degreDeFinalisationDemarcheHints: {
  [key in DegreDeFinalisationDemarche]?: string
} = {
  AFinaliserEnAutonomie: 'Il reste des démarches à finaliser en autonomie.',
  DoitRevenir: 'L’usager devra revenir.',
  OrienteVersStructure: 'L’usager est orienté vers une autre structure.',
}

export const degreDeFinalisationDemarcheOptions = labelsToOptions(
  degreDeFinalisationDemarcheLabels,
)

export const degreDeFinalisationDemarcheOptionsWithExtras =
  degreDeFinalisationDemarcheOptions.map(({ label, value }) => ({
    label,
    value,
    hint: degreDeFinalisationDemarcheHints[value],
    extra: {
      illustration: degreDeFinalisationDemarcheIllustrations[value],
    },
  }))

export const degreDeFinalisationDemarcheValues = Object.keys(
  degreDeFinalisationDemarcheLabels,
) as [DegreDeFinalisationDemarche, ...DegreDeFinalisationDemarche[]]

export const degreDeFinalisationDemarcheApiValues = {
  Finalisee: 'finalisee',
  AFinaliserEnAutonomie: 'a_finaliser_en_autonomie',
  DoitRevenir: 'doit_revenir',
  OrienteVersStructure: 'oriente_vers_structure',
} as const satisfies {
  [key in DegreDeFinalisationDemarche]: string
}
