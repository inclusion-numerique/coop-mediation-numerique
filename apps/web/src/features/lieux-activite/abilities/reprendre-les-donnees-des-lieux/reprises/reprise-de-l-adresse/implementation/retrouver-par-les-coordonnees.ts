import { apiAdresseEndpoint } from '@app/web/external-apis/apiAdresse'
import type {
  AdresseRetrouvee,
  CoordonneesSoumises,
} from '../domain/adresse-a-reprendre'
import type { RetrouverParLesCoordonnees } from '../domain/reprise-de-l-adresse'
import { ligneDuTableau, lots } from './csv-de-la-ban'

const POINTS_PAR_LOT = 2000

const REVERSE = apiAdresseEndpoint.replace(/\/search$/u, '/reverse')

type Appariement = readonly [string, AdresseRetrouvee]

const enCsv = (points: readonly CoordonneesSoumises[]): string =>
  [
    'lieu_id,latitude,longitude,code_insee',
    ...points.map(({ lieuId, latitude, longitude, codeInsee }) =>
      [lieuId, latitude, longitude, codeInsee ?? ''].join(','),
    ),
  ].join('\n')

const corps = (points: readonly CoordonneesSoumises[]): FormData => {
  const formulaire = new FormData()

  formulaire.append(
    'data',
    new Blob([enCsv(points)], { type: 'text/csv' }),
    'points.csv',
  )

  return formulaire
}

const retrouvee = (
  colonnes: readonly string[],
  ligne: readonly string[],
): readonly Appariement[] => {
  const champ = (nom: string): string =>
    ligne[colonnes.indexOf(nom)]?.trim() ?? ''

  if (champ('result_id') === '') return []

  return [
    [
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
        longitude: Number(champ('longitude')),
        libelle: champ('result_label'),
        distance: Number(champ('result_distance')),
      },
    ],
  ]
}

const soumettre = async (
  points: readonly CoordonneesSoumises[],
): Promise<readonly Appariement[]> => {
  const reponse = await fetch(`${REVERSE}/csv/`, {
    method: 'POST',
    body: corps(points),
  })

  if (!reponse.ok)
    throw new Error(
      `La Base Adresse Nationale a répondu ${reponse.status} au géocodage inverse d'un lot de ${points.length} points`,
    )

  return ligneDuTableau(await reponse.text(), retrouvee)
}

/**
 * Ce que la Base Adresse Nationale trouve aux points qu'on lui montre.
 *
 * Le recours quand l'adresse écrite ne suffit pas : des imports ont mis dans la
 * ligne de voie le nom de la commune ou celui du bâtiment, tout en posant des
 * coordonnées justes.
 */
export const retrouverParLesCoordonnees: RetrouverParLesCoordonnees = async (
  coordonnees,
) =>
  new Map(
    await lots(coordonnees, POINTS_PAR_LOT).reduce<
      Promise<readonly Appariement[]>
    >(
      async (acquis, lot) => [...(await acquis), ...(await soumettre(lot))],
      Promise.resolve([]),
    ),
  )
