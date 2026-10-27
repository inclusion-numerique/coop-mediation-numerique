import { niveauAtelierApiValues } from '@app/web/features/activites/use-cases/cra/collectif/fields/niveau-atelier'
import { materielApiValues } from '@app/web/features/activites/use-cases/cra/fields/materiel'
import { thematiqueApiValues } from '@app/web/features/activites/use-cases/cra/fields/thematique'
import { typeActiviteApiValues } from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import { typeLieuApiValues } from '@app/web/features/activites/use-cases/cra/fields/type-lieu'
import { autonomieApiValues } from '@app/web/features/activites/use-cases/cra/individuel/fields/autonomie'
import { structureDeRedirectionApiValues } from '@app/web/features/activites/use-cases/cra/individuel/fields/structures-redirection'
import type {
  Genre,
  StatutSocial,
  TrancheAge,
} from '@app/web/generated/prisma/client'
import type { ActiviteExposee } from '../prisma/activites-exposees.query'

const genreApiValues = {
  Masculin: 'masculin',
  Feminin: 'feminin',
  NonCommunique: 'non_communique',
} as const satisfies { [key in Genre]: string }

const trancheAgeApiValues = {
  MoinsDeDouze: 'moins_de_douze',
  DouzeDixHuit: 'douze_dix_huit',
  DixHuitVingtQuatre: 'dix_huit_vingt_quatre',
  VingtCinqTrenteNeuf: 'vingt_cinq_trente_neuf',
  QuaranteCinquanteNeuf: 'quarante_cinquante_neuf',
  SoixanteSoixanteNeuf: 'soixante_soixante_neuf',
  SoixanteDixPlus: 'soixante_dix_plus',
  NonCommunique: 'non_communique',
} as const satisfies { [key in TrancheAge]: string }

const statutSocialApiValues = {
  Scolarise: 'scolarise',
  SansEmploi: 'sans_emploi',
  EnEmploi: 'en_emploi',
  Retraite: 'retraite',
  NonCommunique: 'non_communique',
} as const satisfies { [key in StatutSocial]: string }

type GenreApiValue = (typeof genreApiValues)[Genre]
type TrancheAgeApiValue = (typeof trancheAgeApiValues)[TrancheAge]
type StatutSocialApiValue = (typeof statutSocialApiValues)[StatutSocial]

export type BeneficiairesAttributes = {
  total: number
  genres: { [key in GenreApiValue]: number }
  tranches_age: { [key in TrancheAgeApiValue]: number }
  statuts: { [key in StatutSocialApiValue]: number }
}

export type ActiviteAttributes = {
  type: 'individuel' | 'demarche_administrative' | 'collectif'
  mediateur_id: string
  user_id: string
  accompagnements: number
  date: string
  duree: number
  type_lieu: 'lieu_activite' | 'domicile' | 'a_distance' | 'autre'
  structure_id: string | null
  lieu_code_postal: string | null
  lieu_commune: string | null
  lieu_code_insee: string | null
  creation: string
  modification: string
  suppression: string | null
  autonomie:
    | 'entierement_accompagne'
    | 'partiellement_autonome'
    | 'autonome'
    | null
  oriente_vers_structure: boolean | null
  structure_de_redirection:
    | 'operateur_ou_organisme_en_charge'
    | 'aide_aux_demarches_administratives'
    | 'administration'
    | 'mediation_numerique'
    | 'aide_sociale'
    | 'insertion_professionnelle'
    | 'autre'
    | null
  materiel: ('ordinateur' | 'telephone' | 'tablette' | 'autre' | 'aucun')[]
  thematiques: (
    | 'diagnostic_numerique'
    | 'prendre_en_main_du_materiel'
    | 'maintenance_de_materiel'
    | 'gere_ses_contenus_numeriques'
    | 'navigation_sur_internet'
    | 'email'
    | 'bureautique'
    | 'reseaux_sociaux'
    | 'sante'
    | 'banque_et_achats_en_ligne'
    | 'entrepreneuriat'
    | 'insertion_professionnelle'
    | 'securite_numerique'
    | 'parentalite'
    | 'scolarite_et_numerique'
    | 'creer_avec_le_numerique'
    | 'culture_numerique'
    | 'intelligence_artificielle'
    | 'aide_aux_demarches_administratives'
    | 'papiers_elections_citoyennete'
    | 'famille_scolarite'
    | 'social_sante'
    | 'travail_formation'
    | 'logement'
    | 'transports_mobilite'
    | 'argent_impots'
    | 'justice'
    | 'etrangers_europe'
    | 'loisirs_sports_culture'
    | 'associations'
  )[]
  tags: string[]
  precisions_demarche: string | null
  titre_atelier: string | null
  niveau_atelier: 'debutant' | 'intermediaire' | 'avance' | null
  beneficiaires: BeneficiairesAttributes
}

const aucunBeneficiaire: BeneficiairesAttributes = {
  total: 0,
  genres: { masculin: 0, feminin: 0, non_communique: 0 },
  tranches_age: {
    moins_de_douze: 0,
    douze_dix_huit: 0,
    dix_huit_vingt_quatre: 0,
    vingt_cinq_trente_neuf: 0,
    quarante_cinquante_neuf: 0,
    soixante_soixante_neuf: 0,
    soixante_dix_plus: 0,
    non_communique: 0,
  },
  statuts: {
    scolarise: 0,
    sans_emploi: 0,
    en_emploi: 0,
    retraite: 0,
    non_communique: 0,
  },
}

const incremente = <Cle extends string>(
  compteurs: { [key in Cle]: number },
  cle: Cle,
): { [key in Cle]: number } => ({ ...compteurs, [cle]: compteurs[cle] + 1 })

type BeneficiaireCompte =
  ActiviteExposee['accompagnements'][number]['beneficiaire']

const compteBeneficiaire = (
  compte: BeneficiairesAttributes,
  { genre, trancheAge, statutSocial }: BeneficiaireCompte,
): BeneficiairesAttributes => ({
  total: compte.total + 1,
  genres: incremente(
    compte.genres,
    genre ? genreApiValues[genre] : 'non_communique',
  ),
  tranches_age: incremente(
    compte.tranches_age,
    trancheAge ? trancheAgeApiValues[trancheAge] : 'non_communique',
  ),
  statuts: incremente(
    compte.statuts,
    statutSocial ? statutSocialApiValues[statutSocial] : 'non_communique',
  ),
})

export const beneficiairesComptes = (
  accompagnements: ActiviteExposee['accompagnements'],
): BeneficiairesAttributes =>
  accompagnements
    .map(({ beneficiaire }) => beneficiaire)
    .reduce(compteBeneficiaire, aucunBeneficiaire)

export const activiteExposee = (
  activite: ActiviteExposee,
): ActiviteAttributes => ({
  type: typeActiviteApiValues[activite.type],
  mediateur_id: activite.mediateurId,
  user_id: activite.mediateur.userId,
  date: activite.date.toISOString().slice(0, 10),
  duree: activite.duree,
  structure_id: activite.structureId,
  lieu_code_postal: activite.lieuCodePostal,
  lieu_commune: activite.lieuCommune,
  lieu_code_insee: activite.lieuCodeInsee,
  creation: activite.creation.toISOString(),
  modification: activite.modification.toISOString(),
  suppression: activite.suppression ? activite.suppression.toISOString() : null,
  type_lieu: typeLieuApiValues[activite.typeLieu],
  autonomie: activite.autonomie ? autonomieApiValues[activite.autonomie] : null,
  structure_de_redirection: activite.structureDeRedirection
    ? structureDeRedirectionApiValues[activite.structureDeRedirection]
    : null,
  thematiques: activite.thematiques.map(
    (thematique) => thematiqueApiValues[thematique],
  ),
  tags: activite.tags.map(({ tag: { nom } }) => nom),
  materiel: activite.materiel.map((materiel) => materielApiValues[materiel]),
  oriente_vers_structure: activite.orienteVersStructure,
  precisions_demarche: activite.precisionsDemarche,
  titre_atelier: activite.titreAtelier,
  niveau_atelier: activite.niveau
    ? niveauAtelierApiValues[activite.niveau]
    : null,
  accompagnements: activite.accompagnementsCount,
  beneficiaires: beneficiairesComptes(activite.accompagnements),
})
