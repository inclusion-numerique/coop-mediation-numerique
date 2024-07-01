import type {
  Autonomie,
  LieuAccompagnement,
  Materiel,
  PoursuiteAccompagnement,
  ThematiqueAccompagnement,
  ThematiqueDemarcheAdministrative,
} from '@prisma/client'
import { labelsToOptions } from '@app/ui/components/Form/utils/options'

export const dureeAccompagnementLabels = {
  '30': '30min',
  '60': '1h',
  '90': '1h30',
  '120': '2h',
} as const

export const dureeAccompagnementOptions = labelsToOptions(
  dureeAccompagnementLabels,
)

export type DureeAccompagnement = keyof typeof dureeAccompagnementLabels

export const dureeAccompagnementValues = Object.keys(
  dureeAccompagnementLabels,
) as [DureeAccompagnement, ...DureeAccompagnement[]]

export const lieuAccompagnementLabels: { [key in LieuAccompagnement]: string } =
  {
    LieuActivite: 'Lieu d’activité',
    Domicile: 'Au domicile de l’usager',
    ADistance: 'À distance',
  }

export const lieuAccompagnementIllustrations: {
  [key in LieuAccompagnement]?: string
} = {
  LieuActivite: '/dsfr/artwork/pictograms/buildings/city-hall.svg',
  Domicile: '/images/iconographie/thematique-logement.svg',
  ADistance: '/images/iconographie/mednum-internet.svg',
}

export const lieuAccompanementOptions = labelsToOptions(
  lieuAccompagnementLabels,
)

export const lieuAccompagnementHints: { [key in LieuAccompagnement]?: string } =
  {
    ADistance: 'Téléphone ou visio-conférence',
  }

export const lieuAccompagnementOptionsWithExtras = lieuAccompanementOptions.map(
  ({ name, value }) => ({
    name,
    value,
    hint: lieuAccompagnementHints[value as LieuAccompagnement],
    extra: {
      illustration:
        lieuAccompagnementIllustrations[value as LieuAccompagnement],
    },
  }),
)

export const lieuAccompagnementValues = Object.keys(
  lieuAccompagnementLabels,
) as [LieuAccompagnement, ...LieuAccompagnement[]]

export const materielLabels: {
  [key in Materiel]: string
} = {
  Ordinateur: 'Ordinateur',
  Telephone: 'Téléphone',
  Tablette: 'Tablette',
  Autre: 'Autre matériel',
  Aucun: 'Pas de matériel',
}

export const materielOptions = labelsToOptions(materielLabels)

export const materielValues = Object.keys(materielLabels) as [
  Materiel,
  ...Materiel[],
]

export const thematiqueAccompagnementLabels: {
  [key in ThematiqueAccompagnement]: string
} = {
  PrendreEnMainDuMateriel: 'Prendre en main du matériel',
  NavigationSurInternet: 'Navigation sur internet',
  Email: 'E-mail',
  Bureautique: 'Bureautique',
  ReseauxSociaux: 'Réseaux sociaux communication',
  Sante: 'Santé',
  BanqueEtAchatsEnLigne: 'Banque et achats en ligne',
  Entrepreneuriat: 'Entrepreneuriat',
  InsertionProfessionnelle: 'Insertion professionnelle',
  SecuriteNumerique: 'Prévention en sécurité numérique',
  Parentalite: 'Parentalité',
  ScolariteEtNumerique: 'Scolarité et numérique',
  CreerAvecLeNumerique: 'Créer avec le numérique',
  CultureNumerique: 'Culture numérique',
}

export const thematiqueAccompagnementHints: {
  [key in ThematiqueAccompagnement]?: string[]
} = {
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
    'Santé',
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
}

export const thematiqueAccompagnementIllustrations: {
  [key in ThematiqueAccompagnement]?: string
} = {
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
}

export const thematiqueAccompagnementOptions = labelsToOptions(
  thematiqueAccompagnementLabels,
)

export const thematiqueAccompagnementOptionsWithExtras =
  thematiqueAccompagnementOptions.map(({ name, value }) => ({
    name,
    value,
    extra: {
      tooltips:
        thematiqueAccompagnementHints[value as ThematiqueAccompagnement],
      illustration:
        thematiqueAccompagnementIllustrations[
          value as ThematiqueAccompagnement
        ],
    },
  }))

export const thematiqueAccompagnementValues = Object.keys(
  thematiqueAccompagnementLabels,
) as [ThematiqueAccompagnement, ...ThematiqueAccompagnement[]]

export const autonomieLabels: {
  [key in Autonomie]: string
} = {
  EntierementAccompagne: 'L’usager a été entièrement accompagné',
  PartiellementAutonome: 'L’usager a participé à l’accompagnement',
  Autonome: 'L’usager a été plutôt autonome',
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
  thematiqueDemarcheAdministrativeOptions.map(({ name, value }) => ({
    name,
    value,
    extra: {
      tooltips:
        thematiqueDemarcheAdministrativeHints[
          value as ThematiqueDemarcheAdministrative
        ],
      illustration:
        thematiqueDemarcheAdministrativeIllustrations[
          value as ThematiqueDemarcheAdministrative
        ],
    },
  }))

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
  ({ name, value }) => ({
    name,
    value,
    extra: {
      stars: autonomieStars[value as Autonomie],
    },
  }),
)

export const poursuiteAccompagnementLabels: {
  [key in PoursuiteAccompagnement]: string
} = {
  AccompagnementIndividuel: 'Vers un accompagnement individuel',
  AtelierCollectif: 'Vers un atelier collectif',
  AutreStructure: 'Vers une autre structure',
}

export const poursuiteAccompagnementIllustrations: {
  [key in PoursuiteAccompagnement]?: string
} = {
  AccompagnementIndividuel:
    '/images/iconographie/accompagnement-individuel.svg',
  AtelierCollectif: '/images/iconographie/accompagnement-collectif.svg',
  AutreStructure: '/dsfr/artwork/pictograms/digital/avatar.svg',
}

export const poursuiteAccompagnementOptions = labelsToOptions(
  poursuiteAccompagnementLabels,
)

export const poursuiteAccompagnementOptionsWithExtras =
  poursuiteAccompagnementOptions.map(({ name, value }) => ({
    name,
    value,
    extra: {
      illustration:
        poursuiteAccompagnementIllustrations[value as PoursuiteAccompagnement],
    },
  }))

export const poursuiteAccompagnementValues = Object.keys(
  poursuiteAccompagnementLabels,
) as [PoursuiteAccompagnement, ...PoursuiteAccompagnement[]]