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

const corps = (adresses: readonly AdresseSoumise[]): FormData => {
  const formulaire = new FormData()

  formulaire.append(
    'data',
    new Blob([enCsv(adresses)], { type: 'text/csv' }),
    'adresses.csv',
  )
  formulaire.append('columns', 'voie')
  formulaire.append('columns', 'code_postal')
  formulaire.append('columns', 'commune')
  formulaire.append('citycode', 'code_insee')

  return formulaire
}

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
): Promise<readonly Appariement[]> => {
  const reponse = await fetch(`${apiAdresseEndpoint}/csv/`, {
    method: 'POST',
    body: corps(adresses),
  })

  if (!reponse.ok)
    throw new Error(
      `La Base Adresse Nationale a répondu ${reponse.status} au géocodage d'un lot de ${adresses.length} adresses`,
    )

  return ligneDuTableau(await reponse.text(), geocodee)
}

/**
 * Les adresses partent par lots plutôt qu'une à une : la Base Adresse Nationale
 * géocode un fichier entier en une requête, là où douze mille interrogations
 * séparées demanderaient une cadence et une demi-heure.
 *
 * Les lots défilent en file : c'est un service public gratuit, on ne lui envoie
 * pas sept requêtes de deux mille adresses à la fois.
 */
export const geocoderLesAdresses: GeocoderLesAdresses = async (adresses) => {
  const geocodees = await lots(adresses, ADRESSES_PAR_LOT).reduce<
    Promise<readonly Appariement[]>
  >(
    async (acquises, lot) => [...(await acquises), ...(await soumettre(lot))],
    Promise.resolve([]),
  )

  return new Map(geocodees)
}
