import { apiAdresseEndpoint } from '@app/web/external-apis/apiAdresse'
import type {
  AdresseGeocodee,
  AdresseSoumise,
} from '../domain/adresse-a-reprendre'
import type { GeocoderLesAdresses } from '../domain/reprise-de-l-adresse'
import { ligneDuTableau, lots } from './csv-de-la-ban'

type Appariement = readonly [string, AdresseGeocodee]

const ADRESSES_PAR_LOT = 2000

const EN_TETE = ['lieu_id', 'voie', 'code_postal', 'commune', 'code_insee']

/**
 * Deux interrogations pour la même adresse, avec puis sans le code postal.
 *
 * Le code postal enregistré est l'une des données qu'on vient justement chercher
 * à la Base Adresse Nationale : le lui donner en entrée, c'est lui demander de
 * confirmer une erreur. Dès qu'une commune en porte plusieurs, elle préfère
 * alors n'importe quelle voie du code postal demandé à la bonne voie — « Route
 * de Marseille » à Avignon devient « Route de Lyon » parce que la première est
 * en 84140 et non en 84000. L'ôter seul ne suffit pas non plus : ailleurs, c'est
 * lui qui départage. On pose donc les deux questions et le domaine tranche.
 */
const INTERROGATIONS: readonly (readonly string[])[] = [
  ['voie', 'code_postal', 'commune'],
  ['voie', 'commune'],
]

const cellule = (valeur: string): string =>
  `"${valeur.replaceAll('"', '""').replaceAll(/[\n\r;]/gu, ' ')}"`

const enCsv = (adresses: readonly AdresseSoumise[]): string =>
  [
    EN_TETE.join(','),
    ...adresses.map((adresse) =>
      [
        adresse.lieuId,
        cellule(adresse.voie),
        cellule(adresse.codePostal),
        cellule(adresse.commune),
        cellule(adresse.codeInsee ?? ''),
      ].join(','),
    ),
  ].join('\n')

const donnees = (adresses: readonly AdresseSoumise[]): FormData => {
  const formulaire = new FormData()

  formulaire.append(
    'data',
    new Blob([enCsv(adresses)], { type: 'text/csv' }),
    'adresses.csv',
  )
  formulaire.append('citycode', 'code_insee')

  return formulaire
}

const corps = (
  adresses: readonly AdresseSoumise[],
  colonnes: readonly string[],
): FormData =>
  colonnes.reduce((formulaire, colonne) => {
    formulaire.append('columns', colonne)

    return formulaire
  }, donnees(adresses))

const geocodee = (
  colonnes: readonly string[],
  ligne: readonly string[],
): readonly Appariement[] => {
  const champ = (nom: string): string =>
    ligne[colonnes.indexOf(nom)]?.trim() ?? ''

  if (champ('result_id') === '') return []

  const appariement: Appariement = [
    champ('lieu_id'),
    {
      type: champ('result_type'),
      score: Number(champ('result_score')),
      banId: champ('result_id'),
      voie: champ('result_name'),
      commune: champ('result_city'),
      codePostal: champ('result_postcode'),
      codeInsee: champ('result_citycode'),
      ancienCodeInsee: champ('result_oldcitycode'),
      latitude: Number(champ('latitude')),
      longitude:
        champ('longitude') === '' ? Number.NaN : Number(champ('longitude')),
      libelle: champ('result_label'),
    },
  ]

  return [appariement]
}

const soumettre = async (
  adresses: readonly AdresseSoumise[],
  colonnes: readonly string[],
): Promise<readonly Appariement[]> => {
  if (adresses.length === 0) return []

  const reponse = await fetch(`${apiAdresseEndpoint}/csv/`, {
    method: 'POST',
    body: corps(adresses, colonnes),
  })

  if (!reponse.ok)
    throw new Error(
      `La Base Adresse Nationale a répondu ${reponse.status} au géocodage d'un lot de ${adresses.length} adresses`,
    )

  return ligneDuTableau(await reponse.text(), geocodee)
}

/**
 * Une recherche directe, par lots, sur les colonnes demandées.
 *
 * Le géocodage inverse s'en sert lui aussi : la Base Adresse Nationale nomme
 * l'adresse qu'elle trouve à un point, mais ne rend pas ses coordonnées, et
 * c'est en cherchant cette voie qu'on obtient l'entrée complète.
 */
export const rechercherLesVoies = async (
  adresses: readonly AdresseSoumise[],
  colonnes: readonly string[],
): Promise<readonly Appariement[]> =>
  lots(adresses, ADRESSES_PAR_LOT).reduce<Promise<readonly Appariement[]>>(
    async (acquises, lot) => [
      ...(await acquises),
      ...(await soumettre(lot, colonnes)),
    ],
    Promise.resolve([]),
  )

const parLieu = (
  appariements: readonly Appariement[],
): ReadonlyMap<string, readonly AdresseGeocodee[]> =>
  appariements.reduce<Map<string, readonly AdresseGeocodee[]>>(
    (rendues, [lieuId, adresse]) =>
      rendues.set(lieuId, [...(rendues.get(lieuId) ?? []), adresse]),
    new Map(),
  )

/**
 * Les adresses partent par lots plutôt qu'une à une : la Base Adresse Nationale
 * géocode un fichier entier en une requête, là où douze mille interrogations
 * séparées demanderaient une cadence et une demi-heure.
 *
 * Les lots défilent en file : c'est un service public gratuit, on ne lui envoie
 * pas sept requêtes de deux mille adresses à la fois.
 */
export const geocoderLesAdresses: GeocoderLesAdresses = async (adresses) =>
  parLieu(
    await INTERROGATIONS.reduce<Promise<readonly Appariement[]>>(
      async (acquises, colonnes) => [
        ...(await acquises),
        ...(await rechercherLesVoies(adresses, colonnes)),
      ],
      Promise.resolve([]),
    ),
  )
