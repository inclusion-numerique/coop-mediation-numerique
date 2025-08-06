import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { HouseIcon } from '@app/web/features/pictograms/buildings/HouseIcon'
import { AIIcon } from '@app/web/features/pictograms/digital/AIIcon'
import { DevicesIcon } from '@app/web/features/pictograms/digital/DevicesIcon'
import { InternetIcon } from '@app/web/features/pictograms/digital/InternetIcon'
import { MailSendIcon } from '@app/web/features/pictograms/digital/MailSendIcon'
import { MediaIcon } from '@app/web/features/pictograms/digital/MediaIcon'
import { NetworkIcon } from '@app/web/features/pictograms/digital/NetworkIcon'
import { DocumentContentIcon } from '@app/web/features/pictograms/document/DocumentContentIcon'
import { DocumentSearchIcon } from '@app/web/features/pictograms/document/DocumentSearchIcon'
import { NationalIdentityCardIcon } from '@app/web/features/pictograms/document/NationalIdentityCardIcon'
import { PapersIcon } from '@app/web/features/pictograms/document/PapersIcon'
import { HumanCooperationIcon } from '@app/web/features/pictograms/environment/HumanCooperationIcon'
import { CareIcon } from '@app/web/features/pictograms/health/CareIcon'
import { HealthIcon } from '@app/web/features/pictograms/health/HealthIcon'
import { JusticeIcon } from '@app/web/features/pictograms/institutions/JusticeIcon'
import { MoneyIcon } from '@app/web/features/pictograms/institutions/MoneyIcon'
import { ActivitiesIcon } from '@app/web/features/pictograms/leisure/ActivitiesIcon'
import { CommunityIcon } from '@app/web/features/pictograms/leisure/CommunityIcon'
import { JourneyIcon } from '@app/web/features/pictograms/leisure/JourneyIcon'
import { TransportationIcon } from '@app/web/features/pictograms/map/TransportationIcon'
import { Pictogram } from '@app/web/features/pictograms/pictogram'
import { PadlockIcon } from '@app/web/features/pictograms/system/PadlockIcon'
import { SystemIcon } from '@app/web/features/pictograms/system/SystemIcon'
import { ParentIcon } from '@app/web/features/pictograms/user/ParentIcon'
import { UserStatsIcon } from '@app/web/features/pictograms/user/UserStatsIcon'
import { PairIcon } from '@app/web/features/pictograms/work/PairIcon'
import { ProfessionalIcon } from '@app/web/features/pictograms/work/ProfessionalIcon'
import { ScolarshipIcon } from '@app/web/features/pictograms/work/ScolarshipIcon'
import { Thematique } from '@prisma/client'

export const thematiquesNonAdministrativesInfo = {
  AideAuxDemarchesAdministratives:
    'En sélectionnant cette thématique, vous pourrez ajouter des informations spécifiques sur la démarche concernée.',
} as const

export const thematiquesInfo: {
  [key in Thematique]?: string
} = {
  ...thematiquesNonAdministrativesInfo,
}

export const thematiquesNonAdministrativesLabels = {
  DiagnosticNumerique: 'Diagnostic numérique',
  PrendreEnMainDuMateriel: 'Prendre en main du matériel',
  MaintenanceDeMateriel: 'Maintenance de matériel',
  GereSesContenusNumeriques: 'Gérer ses contenus numériques',
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
  CreerAvecLeNumerique: 'Créer avec le numérique',
  CultureNumerique: 'Culture numérique',
  IntelligenceArtificielle: 'Intelligence artificielle (IA)',
  AideAuxDemarchesAdministratives: 'Aide aux démarches administratives',
} as const

export const thematiquesAdministrativesLabels = {
  PapiersElectionsCitoyennete: 'Papiers - Élections Citoyenneté',
  FamilleScolarite: 'Famille - Scolarité',
  SocialSante: 'Social - Santé',
  TravailFormation: 'Travail - Formation - Entreprise',
  Logement: 'Logement',
  TransportsMobilite: 'Transports - Mobilité',
  ArgentImpots: 'Argent - Impôts',
  Justice: 'Justice',
  EtrangersEurope: 'Étrangers - Europe',
  LoisirsSportsCulture: 'Loisirs - Sports Culture',
  Associations: 'Associations',
} as const

export const thematiqueLabels: {
  [key in Thematique]: string
} = {
  ...thematiquesNonAdministrativesLabels,
  ...thematiquesAdministrativesLabels,
}

export const thematiquesNonAdministrativesHints = {
  DiagnosticNumerique: [
    'Évaluation des compétences numériques des bénéficiaires',
    'Réaliser un questionnaire d’évaluation (ex : ABC Diag de Pix)',
  ],
  PrendreEnMainDuMateriel: [
    'Utiliser un ordinateur, une tablette ou un smartphone',
    'Utiliser des périphériques (réseau wifi, clé USB, imprimante, scanner…)',
    'Connaître & configurer les outils de base',
  ],
  MaintenanceDeMateriel: [
    'Maintenance de niveau 1',
    'Installation et paramétrage de matériel informatique',
    'Mise à jour des systèmes, installer/désinstaller outils et applications...',
  ],
  GereSesContenusNumeriques: [
    'Organiser, stocker et retrouver des données, des informations et des contenus dans des environnements numériques',
    'ex. : base de données, espace de stockage en ligne, gestionnaire de fichiers...',
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
    'Accompagner un groupe scolaire et/ou un enfant sur un outil numérique',
    'Évaluer le niveau des jeunes avec un logiciel (maths, français, etc.)',
  ],
  CreerAvecLeNumerique: [
    'Création / gestion de médias : photos, vidéos, illustrations',
    'Fablabs : impression 3D, code',
  ],
  CultureNumerique: [
    'Usages responsables du numérique',
    'Fake news, éducation aux médias',
    'Citoyenneté & engagement',
    'RGPD, Open Source, Licences libres…',
  ],
  AideAuxDemarchesAdministratives: [
    'Aider le bénéficiaire à trouver la bonne plateforme pour sa démarche',
    'Apprendre à s’inscrire et utiliser les services : CAF, Impôts, France Connect, etc...',
  ],
} as const

export const thematiquesAdministrativesHints = {
  IntelligenceArtificielle: [
    'Comprendre les enjeux autour de l’IA',
    'Utiliser et interagir de manière critique avec les outils d’IA',
    'Animer un Café IA dans le cadre d’un atelier collectif',
  ],
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
  Associations: [
    'Statuts, Fonctionnement, Financement...',
    'Familles rurales · Croix-Rouge Française · Les Restos du cœur · Emmaüs',
  ],
} as const

export const thematiqueHints: {
  [key in Thematique]: readonly string[]
} = {
  ...thematiquesAdministrativesHints,
  ...thematiquesNonAdministrativesHints,
}

export const thematiquesNonAdministrativesIllustrations = {
  DiagnosticNumerique: UserStatsIcon,
  PrendreEnMainDuMateriel: DevicesIcon,
  MaintenanceDeMateriel: SystemIcon,
  GereSesContenusNumeriques: DocumentSearchIcon,
  NavigationSurInternet: InternetIcon,
  Email: MailSendIcon,
  Bureautique: DocumentContentIcon,
  ReseauxSociaux: CommunityIcon,
  Sante: CareIcon,
  BanqueEtAchatsEnLigne: MoneyIcon,
  Entrepreneuriat: PairIcon,
  InsertionProfessionnelle: ProfessionalIcon,
  SecuriteNumerique: PadlockIcon,
  Parentalite: ParentIcon,
  ScolariteEtNumerique: ScolarshipIcon,
  CreerAvecLeNumerique: MediaIcon,
  CultureNumerique: NetworkIcon,
  IntelligenceArtificielle: AIIcon,
  AideAuxDemarchesAdministratives: PapersIcon,
} as const

export const thematiquesAdministrativesIllustrations = {
  PapiersElectionsCitoyennete: NationalIdentityCardIcon,
  FamilleScolarite: ScolarshipIcon,
  SocialSante: HealthIcon,
  TravailFormation: PairIcon,
  Logement: HouseIcon,
  TransportsMobilite: TransportationIcon,
  ArgentImpots: MoneyIcon,
  Justice: JusticeIcon,
  EtrangersEurope: JourneyIcon,
  LoisirsSportsCulture: ActivitiesIcon,
  Associations: HumanCooperationIcon,
} as const

export const thematiqueIllustrations: Record<Thematique, Pictogram> = {
  ...thematiquesNonAdministrativesIllustrations,
  ...thematiquesAdministrativesIllustrations,
}

export const thematiqueNonAdministrativesOptions = labelsToOptions(
  thematiquesNonAdministrativesLabels,
).map(({ label, value }) => ({
  label,
  value,
}))

export const thematiqueNonAdministrativesOptionsWithExtras = labelsToOptions(
  thematiquesNonAdministrativesLabels,
).map(({ label, value }) => ({
  label,
  value,
  hint: thematiquesInfo[value],
  extra: {
    tooltips: thematiqueHints[value],
    illustration: thematiqueIllustrations[value],
  },
}))

export const thematiqueAdministrativesOptions = labelsToOptions(
  thematiquesAdministrativesLabels,
).map(({ label, value }) => ({
  label,
  value,
}))

export const thematiqueAdministrativesOptionsWithExtras = labelsToOptions(
  thematiquesAdministrativesLabels,
).map(({ label, value }) => ({
  label,
  value,
  hint: thematiquesInfo[value],
  extra: {
    tooltips: thematiqueHints[value],
    illustration: thematiqueIllustrations[value],
  },
}))

export const thematiquesNonAdministrativesValues = Object.keys(
  thematiquesNonAdministrativesLabels,
) as [Thematique, ...Thematique[]]

export const thematiquesAdministrativesValues = Object.keys(
  thematiquesAdministrativesLabels,
) as [Thematique, ...Thematique[]]

export const thematiqueValues = Object.keys(thematiqueLabels) as [
  Thematique,
  ...Thematique[],
]

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
