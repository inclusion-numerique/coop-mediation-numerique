import type {
  MatchingEtablissement,
  UniteLegale,
} from '@app/web/external-apis/apiEntrepriseApiModels'
import type {
  RechercheApiEntrepriseQueryParams,
  RechercheApiResponse,
} from '@app/web/external-apis/rechercheApiEntreprise'

/**
 * Doublure de l'API Recherche d'entreprises pour les parcours e2e.
 *
 * L'inscription résout le SIRET de l'utilisateur au rendu de la page
 * `initialiser`, pour en déduire son employeuse. Or l'API rend `null` en cas
 * d'erreur — délibérément, l'inscription ne doit pas échouer parce qu'un
 * service public est lent — si bien qu'une indisponibilité se traduit par une
 * employeuse silencieusement absente. En e2e, cela rendait le parcours
 * médiateur rouge ou vert selon la forme de l'API ce jour-là.
 *
 * Les valeurs ci-dessous sont celles que l'API rend réellement pour ces deux
 * SIRET : la doublure ne raconte pas une histoire différente de la production,
 * elle la raconte de façon reproductible.
 */

/**
 * Le modèle déclare ces drapeaux obligatoires alors que l'API ne les émet pas
 * pour ces établissements — ils sont absents de la charge utile réelle. Aucun
 * appelant ne les lit ; `false` satisfait le type sans rien affirmer.
 */
const drapeaux = {
  convention_collective_renseignee: false,
  egapro_renseignee: false,
  est_association: false,
  est_bio: false,
  est_entrepreneur_individuel: false,
  est_entrepreneur_spectacle: false,
  est_ess: false,
  est_finess: false,
  est_organisme_formation: false,
  est_qualiopi: false,
  est_rge: false,
  est_siae: false,
  est_service_public: false,
  est_societe_mission: false,
  est_uai: false,
  liste_id_organisme_formation: [],
  statut_bio: false,
}

const etablissementSegur = {
  ...drapeaux,
  activite_principale: '84.12Z',
  adresse: '20 AVENUE DE SEGUR 75007 PARIS',
  caractere_employeur: 'O',
  code_postal: '75007',
  commune: '75107',
  est_siege: true,
  etat_administratif: 'A',
  latitude: '48.850466845484',
  liste_idcc: [],
  liste_rge: [],
  liste_uai: [],
  longitude: '2.30845866278063',
  libelle_commune: 'PARIS',
  dirigeants: [],
} satisfies Omit<MatchingEtablissement, 'siret'>

const uniteLegale = ({
  siren,
  nomComplet,
  raisonSociale,
  natureJuridique,
  activitePrincipale,
  siret,
}: {
  siren: string
  nomComplet: string
  raisonSociale: string
  natureJuridique: string
  activitePrincipale: string
  siret: string
}): UniteLegale => ({
  siren,
  nom_complet: nomComplet,
  nom_raison_sociale: raisonSociale,
  nombre_etablissements: 1,
  nombre_etablissements_ouverts: 1,
  siege: { siret } as UniteLegale['siege'],
  date_creation: '2020-01-01',
  tranche_effectif_salarie: 'NN',
  annee_tranche_effectif_salarie: '2024',
  date_mise_a_jour: '2024-01-01',
  categorie_entreprise: 'GE',
  caractere_employeur: 'O',
  annee_categorie_entreprise: '2024',
  etat_administratif: 'A',
  nature_juridique: natureJuridique,
  activite_principale: activitePrincipale,
  section_activite_principale: 'O',
  statut_diffusion: 'O',
  matching_etablissements: [
    { ...etablissementSegur, activite_principale: activitePrincipale, siret },
  ],
  dirigeants: [],
})

/** Les seuls SIRET que les fixtures e2e exercent. */
const uniteLegaleParSiret: Record<string, UniteLegale> = {
  // `previewBranchAuthFallbacks.anctSiret`, porté par les médiateurs et
  // coordinateurs d'inscription.
  '13002603200016': uniteLegale({
    siren: '130026032',
    nomComplet: 'AGENCE NATIONALE DE LA COHESION DES TERRITOIRES (ANCT)',
    raisonSociale: 'AGENCE NATIONALE DE LA COHESION DES TERRITOIRES',
    natureJuridique: '7389',
    activitePrincipale: '84.12Z',
    siret: '13002603200016',
  }),
  // `structureEmployeuseSiret`, la structure employeuse de fixture.
  '13002526500013': uniteLegale({
    siren: '130025265',
    nomComplet: 'DIRECTION INTERMINISTERIELLE DU NUMERIQUE (DINUM)',
    raisonSociale: 'DIRECTION INTERMINISTERIELLE DU NUMERIQUE',
    natureJuridique: '7120',
    activitePrincipale: '84.11Z',
    siret: '13002526500013',
  }),
}

const reponse = (results: UniteLegale[]): RechercheApiResponse => ({
  results,
  total_results: results.length,
  page: 1,
  per_page: 25,
  total_pages: results.length === 0 ? 0 : 1,
})

/**
 * Un SIRET inconnu rend zéro résultat plutôt qu'une erreur : c'est ce que fait
 * l'API pour une recherche qui n'aboutit pas, et ça garde la doublure honnête
 * sur le cas « structure introuvable » que les parcours doivent savoir tenir.
 */
export const rechercheApiEntrepriseE2e = ({
  q,
}: RechercheApiEntrepriseQueryParams): RechercheApiResponse => {
  const trouvee = uniteLegaleParSiret[q.trim()]

  return reponse(trouvee ? [trouvee] : [])
}
