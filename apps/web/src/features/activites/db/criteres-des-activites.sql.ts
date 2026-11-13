import { Prisma } from '@app/web/generated/prisma/client'
import type {
  CriteresDesActivites,
  THEMATIQUES_RECHERCHEES,
  TYPES_D_ACTIVITE,
} from '../domain'

export type FiltreDesConseillersNumeriques = (
  colonneUtilisateur: string,
  conseillersNumeriques: boolean,
) => Prisma.Sql

const TYPE_EN_BASE: Readonly<
  Record<(typeof TYPES_D_ACTIVITE)[number], string>
> = {
  Individuel: 'individuel',
  Collectif: 'collectif',
}

const THEMATIQUE_EN_BASE: Readonly<
  Record<(typeof THEMATIQUES_RECHERCHEES)[number], string>
> = {
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
}

export const enBase =
  <K extends string, V extends string>(table: Readonly<Record<K, V>>) =>
  (cle: K): V =>
    table[cle]

const codeInseeDuLieu = Prisma.sql`COALESCE(str.code_insee, act.lieu_code_insee)`

const AIDE_AUX_DEMARCHES = THEMATIQUE_EN_BASE.AideAuxDemarchesAdministratives

export const siNonVide = <T>(
  valeurs: readonly T[],
  condition: (valeurs: readonly T[]) => Prisma.Sql,
): readonly Prisma.Sql[] => (valeurs.length === 0 ? [] : [condition(valeurs)])

export const siDefini = <T>(
  valeur: T | null,
  condition: (valeur: T) => Prisma.Sql,
): readonly Prisma.Sql[] => (valeur === null ? [] : [condition(valeur)])

export type CriteresCommunsDesActivites = Omit<
  CriteresDesActivites,
  'periode' | 'statutsDeRendezVous'
>

export const enConjonction = (conditions: readonly Prisma.Sql[]): Prisma.Sql =>
  conditions.length === 0
    ? Prisma.sql`TRUE`
    : Prisma.join([...conditions], ' AND ')

export const conditionsCommunes = (
  criteres: CriteresCommunsDesActivites,
  {
    conseillersNumeriques,
  }: { readonly conseillersNumeriques: FiltreDesConseillersNumeriques },
): readonly Prisma.Sql[] => [
  ...siNonVide(
    criteres.types,
    (types) =>
      Prisma.sql`act.type = ANY(${types.map(enBase(TYPE_EN_BASE))}::type_activite[])`,
  ),
  ...siNonVide(
    criteres.lieux,
    (lieux) => Prisma.sql`act.structure_id = ANY(${lieux}::uuid[])`,
  ),
  ...siNonVide(
    criteres.communes,
    (communes) => Prisma.sql`${codeInseeDuLieu} = ANY(${communes}::text[])`,
  ),
  ...siNonVide(
    criteres.departements,
    (departements) =>
      Prisma.sql`${codeInseeDuLieu} LIKE ANY(${departements.map((departement) => `${departement}%`)}::text[])`,
  ),
  ...siNonVide(
    criteres.beneficiaires,
    (beneficiaires) => Prisma.sql`EXISTS (
        SELECT 1 FROM accompagnements acc
        WHERE acc.activite_id = act.id
          AND acc.beneficiaire_id = ANY(${beneficiaires}::uuid[])
      )`,
  ),
  ...siNonVide(
    criteres.mediateurs,
    (mediateurs) => Prisma.sql`act.mediateur_id = ANY(${mediateurs}::uuid[])`,
  ),
  ...siDefini(criteres.dispositif, (dispositif) =>
    conseillersNumeriques('u.id', dispositif === 'ConseillersNumeriques'),
  ),
  ...siDefini(criteres.demarche, (demarche) =>
    demarche === 'Avec'
      ? Prisma.sql`${AIDE_AUX_DEMARCHES}::thematique = ANY(act.thematiques)`
      : Prisma.sql`NOT (${AIDE_AUX_DEMARCHES}::thematique = ANY(act.thematiques))`,
  ),
  ...siDefini(criteres.origine, (origine) =>
    origine === 'RendezVous'
      ? Prisma.sql`act.rdv_id IS NOT NULL`
      : Prisma.sql`act.rdv_id IS NULL`,
  ),
  ...siNonVide(
    criteres.thematiques,
    (thematiques) =>
      Prisma.sql`act.thematiques && ${thematiques.map(enBase(THEMATIQUE_EN_BASE))}::thematique[]`,
  ),
  ...siNonVide(
    criteres.tags,
    (tags) => Prisma.sql`EXISTS (
        SELECT 1 FROM activite_tags at
        WHERE at.activite_id = act.id
          AND at.tag_id = ANY(${tags}::uuid[])
      )`,
  ),
  ...siNonVide(
    criteres.employeuses,
    (employeuses) =>
      Prisma.sql`act.structure_employeuse_main_id = ANY(${employeuses}::integer[])`,
  ),
  ...siDefini(criteres.source, (source) =>
    source === 'ImportV1'
      ? Prisma.sql`act.v1_cra_id IS NOT NULL`
      : Prisma.sql`act.v1_cra_id IS NULL`,
  ),
]

export const filtreDesActivites = (
  criteres: CriteresDesActivites,
  dependances: {
    readonly conseillersNumeriques: FiltreDesConseillersNumeriques
  },
): Prisma.Sql =>
  enConjonction([
    ...siDefini(
      criteres.periode,
      ({ du, au }) =>
        Prisma.sql`act.date::date BETWEEN ${du}::date AND ${au}::date`,
    ),
    ...conditionsCommunes(criteres, dependances),
  ])
