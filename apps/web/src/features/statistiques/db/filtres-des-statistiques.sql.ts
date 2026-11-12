import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { Prisma, type Thematique } from '@app/web/generated/prisma/client'
import type { ActivitesFilters } from '../domain/filtres-des-statistiques'

const THEMATIQUE_EN_BASE: Readonly<Record<Thematique, string>> = {
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

const AIDE_AUX_DEMARCHES = THEMATIQUE_EN_BASE.AideAuxDemarchesAdministratives

const codeInseeDuLieu = Prisma.sql`COALESCE(str.code_insee, act.lieu_code_insee)`

const siNonVide = <T>(
  valeurs: readonly T[] | undefined,
  condition: (valeurs: readonly T[]) => Prisma.Sql,
): readonly Prisma.Sql[] =>
  valeurs === undefined || valeurs.length === 0 ? [] : [condition(valeurs)]

const siDefini = <T>(
  valeur: T | undefined,
  condition: (valeur: T) => Prisma.Sql,
): readonly Prisma.Sql[] => (valeur === undefined ? [] : [condition(valeur)])

const parUnOuZero = (
  valeur: '0' | '1',
  siUn: Prisma.Sql,
  siZero: Prisma.Sql,
): Prisma.Sql => (valeur === '1' ? siUn : siZero)

export const filtreDesStatistiques = ({
  du,
  au,
  types,
  lieux,
  communes,
  departements,
  beneficiaires,
  mediateurs,
  conseiller_numerique,
  demarches_administratives,
  rdv,
  thematiqueNonAdministratives,
  thematiqueAdministratives,
  tags,
  structuresEmployeuses,
  source,
}: ActivitesFilters): Prisma.Sql => {
  const thematiques = [
    ...(thematiqueNonAdministratives ?? []),
    ...(thematiqueAdministratives ?? []),
  ]
  const employeuses = (structuresEmployeuses ?? [])
    .map(Number)
    .filter((valeur) => Number.isInteger(valeur))
  const conditions: readonly Prisma.Sql[] = [
    ...siDefini(du, (jour) => Prisma.sql`act.date::date >= ${jour}::date`),
    ...siDefini(au, (jour) => Prisma.sql`act.date::date <= ${jour}::date`),
    ...siNonVide(
      types,
      (valeurs) => Prisma.sql`act.type::text = ANY(${valeurs}::text[])`,
    ),
    ...siNonVide(
      lieux,
      (valeurs) => Prisma.sql`act.structure_id = ANY(${valeurs}::uuid[])`,
    ),
    ...siNonVide(
      communes,
      (valeurs) => Prisma.sql`${codeInseeDuLieu} = ANY(${valeurs}::text[])`,
    ),
    ...siNonVide(
      departements,
      (valeurs) =>
        Prisma.sql`${codeInseeDuLieu} LIKE ANY(${valeurs.map((departement) => `${departement}%`)}::text[])`,
    ),
    ...siNonVide(
      beneficiaires,
      (valeurs) => Prisma.sql`EXISTS (
        SELECT 1 FROM accompagnements acc
        WHERE acc.beneficiaire_id = ANY(${valeurs}::uuid[])
          AND acc.activite_id = act.id
      )`,
    ),
    ...siNonVide(
      mediateurs,
      (valeurs) => Prisma.sql`act.mediateur_id = ANY(${valeurs}::uuid[])`,
    ),
    ...siDefini(conseiller_numerique, (valeur) =>
      conseillerNumeriqueSql('u.id', valeur === '1'),
    ),
    ...siDefini(demarches_administratives, (valeur) =>
      parUnOuZero(
        valeur,
        Prisma.sql`${AIDE_AUX_DEMARCHES} = ANY(act.thematiques::text[])`,
        Prisma.sql`NOT (${AIDE_AUX_DEMARCHES} = ANY(act.thematiques::text[]))`,
      ),
    ),
    ...siDefini(rdv, (valeur) =>
      parUnOuZero(
        valeur,
        Prisma.sql`act.rdv_service_public_id IS NOT NULL`,
        Prisma.sql`act.rdv_service_public_id IS NULL`,
      ),
    ),
    ...siNonVide(
      thematiques,
      (valeurs) =>
        Prisma.sql`act.thematiques::text[] && ${valeurs.map((thematique) => THEMATIQUE_EN_BASE[thematique])}::text[]`,
    ),
    ...siNonVide(
      tags,
      (valeurs) => Prisma.sql`EXISTS (
        SELECT 1 FROM activite_tags at
        WHERE at.activite_id = act.id
          AND at.tag_id = ANY(${valeurs}::uuid[])
      )`,
    ),
    ...siNonVide(
      employeuses,
      (valeurs) =>
        Prisma.sql`act.structure_employeuse_main_id = ANY(${valeurs}::integer[])`,
    ),
    ...(source === 'v1' ? [Prisma.sql`act.v1_cra_id IS NOT NULL`] : []),
    ...(source === 'v2' ? [Prisma.sql`act.v1_cra_id IS NULL`] : []),
  ]
  return conditions.length === 0
    ? Prisma.sql`1=1`
    : Prisma.join([...conditions], ' AND ')
}
