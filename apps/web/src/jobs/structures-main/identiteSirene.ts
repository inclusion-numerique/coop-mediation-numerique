import { searchAdresses } from '@app/web/external-apis/apiAdresse'
import { rechercheApiEntreprise } from '@app/web/external-apis/rechercheApiEntreprise'

// IDENTITÉ CANONIQUE d'un établissement, pour alimenter `main.structure_administrative`.
//
// POURQUOI — `creerLigneMain` écrivait le `nom` libre saisi dans la Coop dans une colonne
// nommée `denomination_sirene`, et découpait l'adresse coop à la regex. `main` est une table
// de référence partagée avec les autres produits de l'inclusion numérique : y injecter de la
// saisie utilisateur non vérifiée la dégrade pour tout le monde.
//
// DEUX SOURCES, DANS CET ORDRE :
//   1. API entreprise (recherche-entreprises) — fait foi pour la dénomination, l'adresse,
//      l'activité principale, la catégorie juridique et l'état administratif.
//   2. BAN — normalise l'adresse de l'API entreprise et fournit ses attributs géographiques
//      (clé d'interopérabilité, commune INSEE, coordonnées).
//
// SEUIL BAN à 0,90, comme `normaliser-beneficiaires`. En dessous, on garde l'adresse de l'API
// entreprise telle quelle plutôt que d'accepter un rapprochement douteux.
//
// Bénéfice de bord de la normalisation BAN : `main.adresse` est UNIQUE sur (code postal,
// commune, voie, numéro, répétition), donc deux écritures d'une même rue sous deux graphies
// créent deux lignes. Repasser par la forme canonique fait retomber sur la ligne existante.

export const SEUIL_BAN = 0.9

export type AdresseCanonique = {
  numeroVoie: number | null
  nomVoie: string | null
  repetition: string | null
  codePostal: string
  commune: string
  codeInsee: string
  // Renseignés seulement quand la BAN a répondu au-dessus du seuil.
  clefInterop: string | null
  longitude: number | null
  latitude: number | null
}

export type IdentiteSirene = {
  denomination: string | null
  adresse: AdresseCanonique | null
  codeActivitePrincipale: string | null
  categorieJuridique: string | null
  etatAdministratif: string | null
}

// L'API rend l'adresse complète en une chaîne, suffixée du code postal et de la commune :
// « 14 RUE LOUIS TALAMONI 94500 CHAMPIGNY-SUR-MARNE ». On retire ce suffixe avant de
// géocoder, sinon la BAN le retrouve dans le libellé de voie.
const sansCodePostalNiCommune = (
  adresse: string,
  codePostal: string | undefined,
  commune: string,
): string =>
  adresse
    .replace(new RegExp(`\\s*${codePostal ?? ''}\\s*$`, 'i'), '')
    .replace(new RegExp(`\\s*${commune}\\s*$`, 'i'), '')
    .replace(new RegExp(`\\s*${codePostal ?? ''}\\s*$`, 'i'), '')
    .trim()

// Découpage de repli, quand la BAN n'a pas répondu au-dessus du seuil. Le format SIRENE est
// régulier (numéro, indice de répétition, type puis libellé de voie), donc bien plus sûr à
// découper que la saisie libre de la Coop.
const decouper = (voie: string) => {
  const correspondance = /^(\d+)\s*(BIS|TER|QUATER|[A-Z])?\s+(.*)$/i.exec(
    voie.trim(),
  )

  return correspondance
    ? {
        numeroVoie: Number(correspondance[1]),
        repetition: correspondance[2]?.toUpperCase() ?? null,
        nomVoie: correspondance[3],
      }
    : { numeroVoie: null, repetition: null, nomVoie: voie.trim() || null }
}

// La BAN rend le numéro isolé (« 14 », « 14 bis »), pas « 14 rue X » : découpage dédié.
const decouperNumero = (housenumber: string) => {
  const correspondance = /^(\d+)\s*(.*)$/.exec(housenumber.trim())
  return {
    numeroVoie: correspondance ? Number(correspondance[1]) : null,
    repetition:
      correspondance && correspondance[2] !== ''
        ? correspondance[2].toUpperCase()
        : null,
  }
}

// Géocodage BAN de l'adresse de l'API entreprise, borné à la commune pour éviter qu'une voie
// homonyme d'un autre département ne remonte avec un bon score.
const geocoder = async (
  voie: string,
  codeInsee: string,
): Promise<Omit<AdresseCanonique, 'codeInsee'> | null> => {
  const feature = await searchAdresses(voie, {
    limit: 1,
    autocomplete: false,
    citycode: codeInsee,
  })
    .then((features) => features.at(0) ?? null)
    .catch(() => null)

  if (feature === null || feature.properties.score < SEUIL_BAN) {
    return null
  }

  const { housenumber, street, name, id, city, postcode } = feature.properties

  // La commune et le code postal viennent de la BAN, pas de l'API entreprise : celle-ci rend
  // « CHAMPIGNY-SUR-MARNE » quand `main.adresse` stocke « Champigny-sur-Marne ». Réutiliser sa
  // graphie ferait échouer la réutilisation d'adresse et créerait un doublon de casse.
  return {
    ...(housenumber === undefined
      ? { numeroVoie: null, repetition: null }
      : decouperNumero(housenumber)),
    nomVoie: street ?? name ?? null,
    codePostal: postcode,
    commune: city,
    clefInterop: id,
    longitude: feature.geometry.coordinates.at(0) ?? null,
    latitude: feature.geometry.coordinates.at(1) ?? null,
  }
}

export const identiteSirene = async (
  siret: string,
): Promise<IdentiteSirene | null> => {
  const reponse = await rechercheApiEntreprise({ q: siret, per_page: 1 }).catch(
    () => null,
  )

  const uniteLegale = reponse?.results.at(0)

  if (uniteLegale === undefined) {
    return null
  }

  const siege =
    uniteLegale.siege.siret === siret ? uniteLegale.siege : undefined
  const etablissement =
    siege ??
    uniteLegale.matching_etablissements.find(
      (candidat) => candidat.siret === siret,
    )

  if (etablissement === undefined) {
    return null
  }

  const codeInsee = etablissement.commune
  const codePostal = etablissement.code_postal

  // Le siège porte la voie déjà décomposée ; les autres établissements n'ont que la chaîne
  // complète, dont on retire le code postal et la commune.
  const voie =
    siege === undefined
      ? sansCodePostalNiCommune(
          etablissement.adresse,
          codePostal,
          etablissement.libelle_commune,
        )
      : [
          siege.numero_voie,
          siege.indice_repetition,
          siege.type_voie,
          siege.libelle_voie,
        ]
          .filter((partie) => partie !== undefined && partie !== '')
          .join(' ')

  const banOuRepli =
    codeInsee === undefined || codePostal === undefined
      ? null
      : ((await geocoder(voie, codeInsee)) ?? {
          ...decouper(voie),
          codePostal,
          commune: etablissement.libelle_commune,
          clefInterop: null,
          longitude: null,
          latitude: null,
        })

  return {
    // `nom_raison_sociale` est nul pour les entreprises individuelles, dont SIRENE ne donne
    // que le nom et le prénom via `nom_complet` : les deux restent de la donnée SIRENE.
    denomination:
      uniteLegale.nom_raison_sociale ?? uniteLegale.nom_complet ?? null,
    adresse:
      banOuRepli === null || codeInsee === undefined
        ? null
        : { ...banOuRepli, codeInsee },
    codeActivitePrincipale: etablissement.activite_principale ?? null,
    categorieJuridique: uniteLegale.nature_juridique ?? null,
    etatAdministratif: etablissement.etat_administratif ?? null,
  }
}
