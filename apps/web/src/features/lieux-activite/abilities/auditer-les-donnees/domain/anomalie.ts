import {
  Adresse,
  CodeInsee,
  CodePostal,
  Commune,
  ComplementAdresse,
  Courriel,
  DETAIL_LONGUEUR_MAXIMALE,
  FicheAccesLibre,
  Horaires,
  Localisation,
  Nom,
  RESUME_LONGUEUR_MAXIMALE,
  Siret,
  sansDoublons,
  Telephone,
  triee,
  Url,
  Voie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

/**
 * Ce que la base porte et que les règles n'acceptent plus.
 *
 * Le diagnostic ne réécrit aucune règle : il confronte chaque valeur au modèle
 * du standard qui la gouverne désormais. Une anomalie est donc, par
 * construction, exactement ce que le code écarterait — ni plus, ni moins.
 *
 * Il se pose sur la ligne BRUTE, telle que la base la rend aujourd'hui, et non
 * sur le domaine : c'est l'écart entre les deux qu'on cherche, et le domaine le
 * masquerait en écartant les valeurs fautives au passage.
 */

export type Gravite = 'lieu-ecarte' | 'valeur-perdue' | 'a-verifier'

export type Anomalie = {
  readonly code: string
  readonly gravite: Gravite
  readonly champ: string
  readonly valeur: string
}

export type LigneAAuditer = {
  readonly id: string
  readonly nom: string
  readonly siret: string | null
  readonly rna: string | null
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string | null
  readonly complementAdresse: string | null
  readonly banId: string | null
  readonly latitude: number | null
  readonly longitude: number | null
  readonly telephone: string | null
  readonly courriels: readonly string[]
  readonly siteWeb: string | null
  readonly horaires: string | null
  readonly presentationResume: string | null
  readonly presentationDetail: string | null
  readonly ficheAccesLibre: string | null
  readonly priseRdv: string | null
  readonly typologies: readonly string[]
  readonly services: readonly string[]
  readonly modalitesAcces: readonly string[]
  readonly modalitesAccompagnement: readonly string[]
  readonly publicsSpecifiquementAdresses: readonly string[]
  readonly priseEnChargeSpecifique: readonly string[]
  readonly fraisACharge: readonly string[]
  readonly itinerance: readonly string[]
  readonly dispositifProgrammesNationaux: readonly string[]
  readonly formationsLabels: readonly string[]
  readonly autresFormationsLabels: readonly string[]
  readonly visiblePourCartographieNationale: boolean
}

const SEPARATEUR_LISTE = '|'

const nonVide = (valeur: string | null): string | null =>
  valeur != null && valeur.trim() !== '' ? valeur.trim() : null

const anomalie = (
  code: string,
  gravite: Gravite,
  champ: string,
  valeur: string,
): Anomalie => ({ code, gravite, champ, valeur })

/** Un champ facultatif renseigné que son modèle refuse : la valeur se perd. */
const valeurRefusee = (
  code: string,
  champ: string,
  valeur: string | null,
  reconnue: (valeur: string) => boolean,
): readonly Anomalie[] => {
  const saisie = nonVide(valeur)

  return saisie == null || reconnue(saisie)
    ? []
    : [anomalie(code, 'valeur-perdue', champ, saisie)]
}

/**
 * L'adresse est obligatoire à la publication : ce qui la fait tomber écarte le
 * lieu de la cartographie, il ne le diminue pas (D21).
 */
const adresseIncomplete = (ligne: LigneAAuditer): readonly Anomalie[] => {
  const candidate = {
    voie: ligne.adresse,
    commune: ligne.commune,
    code_postal: ligne.codePostal,
    ...(nonVide(ligne.codeInsee) == null
      ? {}
      : { code_insee: ligne.codeInsee ?? '' }),
  }

  if (Adresse.safe(candidate) != null) return []

  const causes = [
    Voie.safe(ligne.adresse) == null
      ? anomalie(
          nonVide(ligne.adresse) == null ? 'voie-absente' : 'voie-non-reconnue',
          'lieu-ecarte',
          'adresse',
          ligne.adresse,
        )
      : null,
    CodePostal.safe(ligne.codePostal) == null
      ? anomalie(
          nonVide(ligne.codePostal) == null
            ? 'code-postal-absent'
            : 'code-postal-invalide',
          'lieu-ecarte',
          'codePostal',
          ligne.codePostal,
        )
      : null,
    Commune.safe(ligne.commune) == null
      ? anomalie(
          'commune-non-reconnue',
          'lieu-ecarte',
          'commune',
          ligne.commune,
        )
      : null,
    nonVide(ligne.codeInsee) != null &&
    CodeInsee.safe(ligne.codeInsee ?? '') == null
      ? anomalie(
          'code-insee-invalide',
          'lieu-ecarte',
          'codeInsee',
          ligne.codeInsee ?? '',
        )
      : null,
  ].filter((cause): cause is Anomalie => cause != null)

  return causes.length > 0
    ? causes
    : [anomalie('adresse-invalide', 'lieu-ecarte', 'adresse', ligne.adresse)]
}

/**
 * Les arrondissements que la Base Adresse Nationale nomme là où la coop stocke
 * la commune-mère. L'écart est normal : le schéma national le refait à la
 * publication, dans l'autre sens.
 */
const ARRONDISSEMENTS: Readonly<Record<string, string>> = {
  '75056': '751',
  '69123': '6938',
  '13055': '132',
}

/**
 * Une adresse ne se stocke que si elle vient de la Base Adresse Nationale.
 *
 * Deux façons de ne pas en venir : n'avoir aucun identifiant BAN, ou en porter
 * un qui désigne une autre commune que celle enregistrée — l'adresse a alors été
 * retouchée après coup, et l'un des deux ment.
 */
const adresseHorsBan = (ligne: LigneAAuditer): readonly Anomalie[] => {
  const banId = nonVide(ligne.banId)

  if (banId == null)
    return [
      anomalie(
        'adresse-hors-ban',
        'a-verifier',
        'banId',
        `${ligne.adresse}, ${ligne.codePostal} ${ligne.commune}`,
      ),
    ]

  const inseeDuBan = banId.split('_')[0]?.toUpperCase() ?? ''
  const insee = (nonVide(ligne.codeInsee) ?? '').toUpperCase()
  const arrondissement = ARRONDISSEMENTS[insee]

  if (
    insee === inseeDuBan ||
    (arrondissement != null && inseeDuBan.startsWith(arrondissement))
  )
    return []

  return [
    anomalie(
      'ban-id-contredit-la-commune',
      'a-verifier',
      'banId',
      `${ligne.commune} (${insee}) mais ban_id ${banId}`,
    ),
  ]
}

/** Les coordonnées doivent tomber dans une emprise française (D18.1). */
const localisationHorsEmprise = (ligne: LigneAAuditer): readonly Anomalie[] => {
  if (ligne.latitude == null || ligne.longitude == null) return []

  const candidate = { latitude: ligne.latitude, longitude: ligne.longitude }

  return Localisation.safe(candidate) != null
    ? []
    : [
        anomalie(
          'localisation-hors-emprise',
          'valeur-perdue',
          'localisation',
          `${ligne.latitude}, ${ligne.longitude}`,
        ),
      ]
}

/** L'ordre d'une liste ne porte rien, une valeur répétée pas davantage (D37). */
const listeDesordonnee = (
  champ: string,
  valeurs: readonly string[],
): readonly Anomalie[] => {
  const dedoublonnee = sansDoublons([...valeurs])
  const rangee = triee(dedoublonnee)

  if (dedoublonnee.length !== valeurs.length)
    return [
      anomalie('liste-en-doublon', 'a-verifier', champ, valeurs.join(', ')),
    ]

  return rangee.join('\u0000') === valeurs.join('\u0000')
    ? []
    : [anomalie('liste-desordonnee', 'a-verifier', champ, valeurs.join(', '))]
}

/**
 * Les colonnes de vocabulaire, dans l'ordre où le relevé les présente.
 *
 * Exportées parce que le relevé en fait des colonnes : une valeur multiple par
 * champ, et le lecteur veut voir d'un coup d'œil lesquelles d'un lieu sont à
 * reprendre.
 */
export const LISTES: readonly (keyof LigneAAuditer)[] = [
  'typologies',
  'services',
  'modalitesAcces',
  'modalitesAccompagnement',
  'publicsSpecifiquementAdresses',
  'priseEnChargeSpecifique',
  'fraisACharge',
  'itinerance',
  'dispositifProgrammesNationaux',
  'formationsLabels',
  'autresFormationsLabels',
]

/**
 * Le diagnostic complet d'une ligne.
 *
 * Les listes de contact — courriels, sites web — se jugent élément par élément :
 * c'est l'élément fautif qui tombe, pas la liste (D29.1).
 */
export const diagnostiquer = (ligne: LigneAAuditer): readonly Anomalie[] => [
  ...(Nom.safe(ligne.nom) == null
    ? [anomalie('nom-vide', 'lieu-ecarte', 'nom', ligne.nom)]
    : []),

  ...adresseIncomplete(ligne),
  ...adresseHorsBan(ligne),
  ...valeurRefusee(
    'complement-non-reconnu',
    'complementAdresse',
    ligne.complementAdresse,
    (valeur) => ComplementAdresse.safe(valeur) != null,
  ),
  ...localisationHorsEmprise(ligne),

  ...valeurRefusee(
    'siret-invalide',
    'siret',
    ligne.siret,
    (valeur) => Siret.safe(valeur) != null,
  ),
  ...(nonVide(ligne.siret) == null && nonVide(ligne.rna) != null
    ? [anomalie('pivot-etait-un-rna', 'valeur-perdue', 'rna', ligne.rna ?? '')]
    : []),

  ...valeurRefusee(
    'telephone-non-conforme',
    'telephone',
    ligne.telephone,
    (valeur) => Telephone.safe(valeur) != null,
  ),
  ...ligne.courriels.flatMap((courriel) =>
    valeurRefusee(
      'courriel-non-conforme',
      'courriels',
      courriel,
      (valeur) => Courriel.safe(valeur) != null,
    ),
  ),
  ...(nonVide(ligne.siteWeb) ?? '')
    .split(SEPARATEUR_LISTE)
    .flatMap((site) =>
      valeurRefusee(
        'site-web-non-conforme',
        'siteWeb',
        site,
        (valeur) => Url.safe(valeur) != null,
      ),
    ),

  ...valeurRefusee(
    'horaires-non-osm',
    'horaires',
    ligne.horaires,
    (valeur) => Horaires.safe(valeur) != null,
  ),
  ...valeurRefusee(
    'resume-trop-long',
    'presentationResume',
    ligne.presentationResume,
    (valeur) => valeur.length <= RESUME_LONGUEUR_MAXIMALE,
  ),
  ...valeurRefusee(
    'detail-trop-long',
    'presentationDetail',
    ligne.presentationDetail,
    (valeur) => valeur.length <= DETAIL_LONGUEUR_MAXIMALE,
  ),
  ...valeurRefusee(
    'fiche-hors-acces-libre',
    'ficheAccesLibre',
    ligne.ficheAccesLibre,
    (valeur) => FicheAccesLibre.safe(valeur) != null,
  ),
  ...valeurRefusee(
    'prise-rdv-non-conforme',
    'priseRdv',
    ligne.priseRdv,
    (valeur) => Url.safe(valeur) != null,
  ),

  ...LISTES.flatMap((champ) =>
    listeDesordonnee(champ, ligne[champ] as readonly string[]),
  ),

  ...(ligne.typologies.length === 0 && ligne.visiblePourCartographieNationale
    ? [anomalie('sans-typologie', 'a-verifier', 'typologies', '')]
    : []),
  ...(ligne.services.length === 0 && ligne.visiblePourCartographieNationale
    ? [anomalie('sans-service', 'lieu-ecarte', 'services', '')]
    : []),
]
